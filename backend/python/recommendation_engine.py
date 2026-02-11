"""
Anima - AI Recommendation Engine
Uses scikit-learn for anime recommendations based on mood/aura search
"""

import json
import numpy as np
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import pickle
import os

# Mood/Aura mappings
MOOD_KEYWORDS = {
    "rainy afternoon": ["slice of life", "drama", "melancholy", "calm", "atmospheric", "emotional"],
    "epic fight scenes": ["action", "shounen", "martial arts", "superpowers", "battle", "tournament"],
    "wholesome and cozy": ["slice of life", "comedy", "iyashikei", "heartwarming", "friendship", "healing"],
    "mind-bending thriller": ["psychological", "thriller", "mystery", "suspense", "plot twist", "dark"],
    "action-packed adventure": ["action", "adventure", "fantasy", "isekai", "journey", "exploration"],
    "emotional and deep": ["drama", "tragedy", "romance", "psychological", "mature", "character development"],
    "high-budget pixel fights": ["action", "animation quality", "sakuga", "mecha", "sci-fi", "fantasy"],
    "romantic comedy": ["romance", "comedy", "school", "slice of life", "heartwarming", "love"],
    "dark and gritty": ["seinen", "dark", "psychological", "horror", "mature", "violence"],
    "nostalgic classic": ["classic", "retro", "90s", "80s", "influential", "legendary"],
}

@dataclass
class AnimeData:
    id: int
    title: str
    description: str
    genres: List[str]
    tags: List[str]
    score: float
    popularity: int

    def to_text(self) -> str:
        """Convert anime data to searchable text"""
        return f"{self.title} {self.description} {' '.join(self.genres)} {' '.join(self.tags)}"


class AnimeRecommendationEngine:
    def __init__(self, model_path: str = "anime_model.pkl"):
        self.model_path = model_path
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.anime_data: List[AnimeData] = []
        self.tfidf_matrix = None
        self.kmeans = None

    def load_anime_data(self, anime_list: List[Dict[str, Any]]) -> None:
        """Load anime data from list of dictionaries"""
        self.anime_data = [
            AnimeData(
                id=anime.get('id', 0),
                title=anime.get('title', ''),
                description=anime.get('description', ''),
                genres=anime.get('genres', []),
                tags=anime.get('tags', []),
                score=anime.get('score', 0),
                popularity=anime.get('popularity', 0)
            )
            for anime in anime_list
        ]

    def train(self) -> None:
        """Train the recommendation model"""
        if not self.anime_data:
            raise ValueError("No anime data loaded. Call load_anime_data first.")

        # Create text corpus
        corpus = [anime.to_text() for anime in self.anime_data]

        # Fit TF-IDF vectorizer
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

        # Cluster anime into groups for faster recommendations
        n_clusters = min(50, len(self.anime_data) // 10)
        if n_clusters > 1:
            self.kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            self.kmeans.fit(self.tfidf_matrix)

    def save_model(self) -> None:
        """Save trained model to disk"""
        model_data = {
            'vectorizer': self.vectorizer,
            'tfidf_matrix': self.tfidf_matrix,
            'kmeans': self.kmeans,
            'anime_data': self.anime_data
        }
        with open(self.model_path, 'wb') as f:
            pickle.dump(model_data, f)

    def load_model(self) -> bool:
        """Load trained model from disk"""
        if not os.path.exists(self.model_path):
            return False
        try:
            with open(self.model_path, 'rb') as f:
                model_data = pickle.load(f)
            self.vectorizer = model_data['vectorizer']
            self.tfidf_matrix = model_data['tfidf_matrix']
            self.kmeans = model_data['kmeans']
            self.anime_data = model_data['anime_data']
            return True
        except Exception:
            return False

    def expand_mood_query(self, query: str) -> str:
        """Expand mood-based query with relevant keywords"""
        query_lower = query.lower()
        expanded_terms = [query]

        for mood, keywords in MOOD_KEYWORDS.items():
            if any(word in query_lower for word in mood.split()):
                expanded_terms.extend(keywords)

        return ' '.join(expanded_terms)

    def search_by_mood(
        self,
        query: str,
        limit: int = 10,
        min_score: float = 0
    ) -> List[Dict[str, Any]]:
        """
        Search anime by mood/aura description

        Args:
            query: Natural language description of desired mood
            limit: Maximum number of results
            min_score: Minimum anime score filter

        Returns:
            List of recommended anime with similarity scores
        """
        if self.tfidf_matrix is None:
            raise ValueError("Model not trained. Call train() first.")

        # Expand query with mood keywords
        expanded_query = self.expand_mood_query(query)

        # Vectorize query
        query_vector = self.vectorizer.transform([expanded_query])

        # Calculate cosine similarity
        similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()

        # Get top indices sorted by similarity
        top_indices = similarities.argsort()[::-1]

        results = []
        for idx in top_indices:
            anime = self.anime_data[idx]
            if anime.score >= min_score:
                results.append({
                    'id': anime.id,
                    'title': anime.title,
                    'genres': anime.genres,
                    'score': anime.score,
                    'similarity': float(similarities[idx]),
                    'description': anime.description[:200] + '...' if len(anime.description) > 200 else anime.description
                })
                if len(results) >= limit:
                    break

        return results

    def find_similar_anime(
        self,
        anime_id: int,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Find anime similar to a given anime"""
        if self.tfidf_matrix is None:
            raise ValueError("Model not trained. Call train() first.")

        # Find anime index
        anime_idx = None
        for idx, anime in enumerate(self.anime_data):
            if anime.id == anime_id:
                anime_idx = idx
                break

        if anime_idx is None:
            return []

        # Calculate similarities
        anime_vector = self.tfidf_matrix[anime_idx]
        similarities = cosine_similarity(anime_vector, self.tfidf_matrix).flatten()

        # Get top similar (excluding self)
        top_indices = similarities.argsort()[::-1][1:limit+1]

        results = []
        for idx in top_indices:
            anime = self.anime_data[idx]
            results.append({
                'id': anime.id,
                'title': anime.title,
                'genres': anime.genres,
                'score': anime.score,
                'similarity': float(similarities[idx])
            })

        return results

    def party_match(
        self,
        user_watchlist: List[int],
        other_users: List[Dict[str, List[int]]],
        min_overlap: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Find users with similar watchlists for party matching

        Args:
            user_watchlist: Current user's plan-to-watch anime IDs
            other_users: List of {user_id, watchlist} dictionaries
            min_overlap: Minimum overlap ratio to consider a match

        Returns:
            List of matched users with compatibility scores
        """
        user_set = set(user_watchlist)
        matches = []

        for other in other_users:
            other_set = set(other['watchlist'])

            # Calculate Jaccard similarity
            intersection = len(user_set & other_set)
            union = len(user_set | other_set)

            if union > 0:
                similarity = intersection / union
                if similarity >= min_overlap:
                    matches.append({
                        'user_id': other['user_id'],
                        'compatibility': similarity,
                        'shared_anime': list(user_set & other_set),
                        'shared_count': intersection
                    })

        # Sort by compatibility
        matches.sort(key=lambda x: x['compatibility'], reverse=True)
        return matches


# Flask API for serving recommendations
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Global engine instance
engine = AnimeRecommendationEngine()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/recommend/mood', methods=['POST'])
def recommend_by_mood():
    """Endpoint for Aura Search - mood-based recommendations"""
    data = request.json
    query = data.get('query', '')
    limit = data.get('limit', 10)
    min_score = data.get('min_score', 0)

    try:
        results = engine.search_by_mood(query, limit, min_score)
        return jsonify({'success': True, 'recommendations': results})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/recommend/similar/<int:anime_id>', methods=['GET'])
def recommend_similar(anime_id: int):
    """Endpoint for finding similar anime"""
    limit = request.args.get('limit', 10, type=int)

    try:
        results = engine.find_similar_anime(anime_id, limit)
        return jsonify({'success': True, 'recommendations': results})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/party/match', methods=['POST'])
def party_match():
    """Endpoint for Party Matching - find users with similar watchlists"""
    data = request.json
    user_watchlist = data.get('watchlist', [])
    other_users = data.get('other_users', [])
    min_overlap = data.get('min_overlap', 0.3)

    try:
        matches = engine.party_match(user_watchlist, other_users, min_overlap)
        return jsonify({'success': True, 'matches': matches})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/train', methods=['POST'])
def train_model():
    """Endpoint to train the model with new anime data"""
    data = request.json
    anime_list = data.get('anime_list', [])

    try:
        engine.load_anime_data(anime_list)
        engine.train()
        engine.save_model()
        return jsonify({'success': True, 'message': 'Model trained successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    # Try to load existing model
    if engine.load_model():
        print("Loaded existing model")
    else:
        print("No existing model found. Train the model using /train endpoint")

    app.run(host='0.0.0.0', port=5000, debug=True)
