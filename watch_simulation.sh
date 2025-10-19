#!/bin/bash
# Live Terminal "GUI" for F1Tenth Simulation

echo "🏎️  Starting F1Tenth Simulation Monitor..."
echo "Press Ctrl+C to stop"
echo ""
sleep 2

while true; do
    clear
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║         🏎️  F1TENTH PLATOONING SIMULATION - LIVE VIEW         ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    docker exec f1tenth_gui_vnc bash -c "
        source /opt/ros/noetic/setup.bash 2>/dev/null
        
        # Get all data in one go
        DATA=\$(rostopic echo /gazebo/model_states -n1 2>/dev/null)
        
        echo '📍 CAR POSITIONS:'
        echo '─────────────────────────────────────────────────────────'
        echo \"\$DATA\" | grep -A 4 'racecar' | head -20
        
        echo ''
        echo '⚡ CAR VELOCITIES:'
        echo '─────────────────────────────────────────────────────────'
        
        LEAD_VX=\$(rostopic echo /racecar/odom/twist/twist/linear/x -n1 2>/dev/null)
        LEAD_VY=\$(rostopic echo /racecar/odom/twist/twist/linear/y -n1 2>/dev/null)
        FOLLOW_VX=\$(rostopic echo /racecar2/odom/twist/twist/linear/x -n1 2>/dev/null)
        FOLLOW_VY=\$(rostopic echo /racecar2/odom/twist/twist/linear/y -n1 2>/dev/null)
        
        printf '🏎️  Lead Car:     Vx = %.3f m/s,  Vy = %.3f m/s\n' \"\$LEAD_VX\" \"\$LEAD_VY\"
        printf '🏎️  Follower:     Vx = %.3f m/s,  Vy = %.3f m/s\n' \"\$FOLLOW_VX\" \"\$FOLLOW_VY\"
        
        echo ''
        echo '🔧 SYSTEM STATUS:'
        echo '─────────────────────────────────────────────────────────'
        NODES=\$(rosnode list 2>/dev/null | wc -l)
        echo \"   Active ROS Nodes: \$NODES\"
        echo '   Track: Porto Circuit'
        echo '   Mode: Platooning (Headless)'
    "
    
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  Updating every 2 seconds... Press Ctrl+C to stop             ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    
    sleep 2
done

