#!/bin/bash
# Easy access script to enter the F1Tenth simulation container

echo "🏎️  Entering F1Tenth Simulation Container..."
echo ""
echo "Available commands once inside:"
echo "  1. Start leader car: rosrun race disparity_extender_vanderbilt.py"
echo "  2. Start follower: rosrun race follow_lead_gen.py racecar racecar2"
echo "  3. View car positions: rostopic echo /gazebo/model_states"
echo "  4. View LIDAR data: rostopic echo /racecar/scan"
echo ""
echo "Type 'exit' to leave the container"
echo "================================================"
echo ""

docker exec -it f1tenth_gui_vnc bash -c "cd /home/Platooning-F1Tenth && source /opt/ros/noetic/setup.bash && source install/setup.bash && bash"

