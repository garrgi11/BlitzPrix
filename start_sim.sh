#!/bin/bash
# Start F1Tenth Platooning Simulation

echo "🏎️  Starting F1Tenth Platooning Simulation..."

# Stop any existing simulation
docker stop f1tenth_gui 2>/dev/null
docker rm f1tenth_gui 2>/dev/null

# Allow X11 display (for GUI)
xhost + localhost 2>/dev/null

echo "Starting simulation container..."
docker run -d --name f1tenth_gui \
  -e DISPLAY=host.docker.internal:0 \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  simulator bash -c "cd /home/Platooning-F1Tenth && \
    source /opt/ros/noetic/setup.bash && \
    source install/setup.bash && \
    roslaunch race multi_parametrizeable.launch number_of_cars:=2 gui:=false"

echo ""
echo "⏳ Waiting for simulation to start (15 seconds)..."
sleep 15

echo ""
echo "✅ Simulation is starting!"
echo ""
echo "To control the cars, run: ./enter_sim.sh"
echo "To see car positions, run: docker exec f1tenth_gui bash -c 'source /opt/ros/noetic/setup.bash && rostopic echo /gazebo/model_states -n1'"
echo "To stop simulation, run: docker stop f1tenth_gui"

