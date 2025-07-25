# ABOUTME: Unit tests for database models
# ABOUTME: Tests model behavior, properties, and validation

import pytest
from app.models.player import Player


class TestPlayerModel:
    """Test Player model behavior"""
    
    def test_player_creation(self):
        """Test basic player model creation"""
        player = Player(
            name="Test Player",
            email="test@example.com",
            elo_rating=1500.0,
            trueskill_mu=25.0,
            trueskill_sigma=8.3333,
            games_played=0,
            wins=0,
            losses=0,
            is_active=True
        )
        
        assert player.name == "Test Player"
        assert player.email == "test@example.com"
        assert player.elo_rating == 1500.0
        assert player.trueskill_mu == 25.0
        assert player.trueskill_sigma == 8.3333
        assert player.games_played == 0
        assert player.wins == 0
        assert player.losses == 0
        assert player.is_active is True
        
    def test_player_without_email(self):
        """Test player creation without email"""
        player = Player(name="No Email Player", is_active=True)
        
        assert player.name == "No Email Player"  
        assert player.email is None
        assert player.is_active is True
        
    def test_win_percentage_calculation(self):
        """Test win percentage property calculation"""
        # Player with no games
        player = Player(name="New Player", games_played=0, wins=0)
        assert player.win_percentage == 0.0
        
        # Player with games
        player = Player(name="Test Player", games_played=10, wins=7, losses=3)
        assert player.win_percentage == 70.0
        
        # Player with all wins
        player = Player(name="Winner", games_played=5, wins=5, losses=0)
        assert player.win_percentage == 100.0
        
        # Player with no wins
        player = Player(name="Loser", games_played=3, wins=0, losses=3)
        assert player.win_percentage == 0.0
        
    def test_player_str_representation(self):
        """Test that player can be converted to string representation"""
        player = Player(name="String Test Player")
        # Should not raise an exception
        str(player)
        
    def test_custom_ratings(self):
        """Test player with custom rating values"""
        player = Player(
            name="Custom Player",
            elo_rating=1800.0,
            trueskill_mu=30.0,
            trueskill_sigma=5.0
        )
        
        assert player.elo_rating == 1800.0
        assert player.trueskill_mu == 30.0
        assert player.trueskill_sigma == 5.0
        
    def test_player_stats(self):
        """Test player with game statistics"""
        player = Player(
            name="Stats Player",
            games_played=20,
            wins=15,
            losses=5
        )
        
        assert player.games_played == 20
        assert player.wins == 15
        assert player.losses == 5
        assert player.win_percentage == 75.0