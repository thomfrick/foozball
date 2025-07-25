#!/usr/bin/env python3
# ABOUTME: Test runner script for easy test execution
# ABOUTME: Provides various test running options with proper setup

import subprocess
import sys
import os


def run_command(cmd, description):
    """Run a command and print results"""
    print(f"\n🔄 {description}")
    print("=" * 50)
    
    result = subprocess.run(cmd, shell=True)
    if result.returncode == 0:
        print(f"✅ {description} - PASSED")
    else:
        print(f"❌ {description} - FAILED")
        return False
    return True


def main():
    """Main test runner"""
    # Change to backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Determine what to run
    if len(sys.argv) > 1:
        test_type = sys.argv[1]
    else:
        test_type = "all"
    
    success = True
    
    if test_type in ["all", "unit"]:
        success &= run_command(
            "uv run pytest tests/unit/ -v",
            "Unit Tests"
        )
    
    if test_type in ["all", "integration"]:
        success &= run_command(
            "uv run pytest tests/integration/ -v", 
            "Integration Tests"
        )
    
    if test_type in ["all", "coverage"]:
        success &= run_command(
            "uv run pytest tests/ --cov=app --cov-report=term-missing --cov-report=html",
            "Coverage Report"
        )
    
    if test_type == "lint":
        success &= run_command(
            "uv run ruff check .",
            "Ruff Linting"
        )
        success &= run_command(
            "uv run ruff format --check .",
            "Ruff Formatting Check"
        )
    
    if test_type == "quick":
        success &= run_command(
            "uv run pytest tests/unit/ -x",
            "Quick Unit Tests (stop on first failure)"
        )
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("💥 Some tests failed!")
        sys.exit(1)


if __name__ == "__main__":
    print("🧪 Foosball API Test Runner")
    print("Usage: python run_tests.py [all|unit|integration|coverage|lint|quick]")
    main()