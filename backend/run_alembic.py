#!/usr/bin/env python3
# ABOUTME: Helper script to run Alembic commands with proper environment setup
# ABOUTME: Ensures all imports and paths are correctly configured

import os
import subprocess
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Change to the backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Forward all arguments to alembic
    cmd = ["alembic"] + sys.argv[1:]
    subprocess.run(cmd)
