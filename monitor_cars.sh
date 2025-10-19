#!/bin/bash
# Monitor car positions in real-time

echo "🏎️  Monitoring Car Positions..."
echo "Press Ctrl+C to stop"
echo ""

while true; do
  docker exec f1tenth_gui bash -c "source /opt/ros/noetic/setup.bash && rostopic echo /gazebo/model_states/name -n1 && rostopic echo /gazebo/model_states/pose -n1" 2>/dev/null | grep -A 15 "racecar"
  sleep 2
  clear
  echo "🏎️  Car Positions (updates every 2 seconds)..."
  echo ""
done

