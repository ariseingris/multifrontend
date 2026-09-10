#!/bin/bash

# Quick Start Script for IoT Demo Framework
# Usage: ./quickstart.sh [scenario] [speed]

SCENARIO=${1:-door_open}
SPEED=${2:-2}

echo "======================================"
echo "  IoT Demo Framework - Quick Start"
echo "======================================"
echo ""
echo "Starting simulator with:"
echo "  Scenario: $SCENARIO"
echo "  Speed: ${SPEED}x"
echo ""

# Check if running on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    PYTHON_CMD="python3"
else
    # Linux
    PYTHON_CMD="python3"
fi

# Start simulator
echo "[1/2] Starting simulator..."
cd simulator

# Check if websockets is installed
$PYTHON_CMD -c "import websockets" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing websockets..."
    pip install websockets
fi

$PYTHON_CMD vitalchain_simulator.py --scenario "$SCENARIO" --speed "$SPEED" &
SIMULATOR_PID=$!
echo "✓ Simulator PID: $SIMULATOR_PID"
echo ""

# Wait for simulator to start
sleep 2

# Start frontend
echo "[2/2] Starting frontend..."
cd ../frontend

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

echo ""
echo "======================================"
echo "  Framework Started Successfully!"
echo "======================================"
echo ""
echo "Frontend:  http://localhost:5173"
echo "Simulator: ws://localhost:8765"
echo ""
echo "Press Ctrl+C to stop both services"
echo "======================================"
echo ""

npm run dev

# Clean up simulator when frontend exits
kill $SIMULATOR_PID 2>/dev/null
