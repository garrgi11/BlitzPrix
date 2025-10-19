#!/bin/bash
# Record car trajectories to a file

echo "🎥 Recording car trajectories..."
echo "Press Ctrl+C to stop recording"
echo ""

OUTPUT_FILE="car_trajectory_$(date +%Y%m%d_%H%M%S).csv"

echo "timestamp,car,x,y,z" > "$OUTPUT_FILE"

docker exec f1tenth_gui bash -c "
source /opt/ros/noetic/setup.bash
rostopic echo /gazebo/model_states -n 1000 | 
grep -A 3 'racecar' | 
awk '/x:|y:|z:/{print}' 
" >> "$OUTPUT_FILE"

echo "✅ Recorded to $OUTPUT_FILE"
echo "You can plot this data in Excel, Python, or MATLAB"

