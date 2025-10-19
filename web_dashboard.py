#!/usr/bin/env python3
"""
Web Dashboard for F1Tenth Simulation
Shows real-time car positions and velocities in your browser
"""

import rospy
from gazebo_msgs.msg import ModelStates
from flask import Flask, render_template_string
import threading
import json

app = Flask(__name__)

car_data = {
    'racecar': {'x': 0, 'y': 0, 'vx': 0, 'vy': 0},
    'racecar2': {'x': 0, 'y': 0, 'vx': 0, 'vy': 0}
}

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>F1Tenth Simulation Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #1a1a2e;
            color: #eee;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #0f4c81;
            text-align: center;
        }
        .car-container {
            display: flex;
            justify-content: space-around;
            margin-top: 30px;
        }
        .car-card {
            background: #16213e;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            width: 45%;
        }
        .car-title {
            font-size: 24px;
            font-weight: bold;
            color: #4ecca3;
            margin-bottom: 15px;
        }
        .data-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px;
            background: #0f3460;
            border-radius: 5px;
        }
        .label {
            font-weight: bold;
            color: #4ecca3;
        }
        .value {
            color: #fff;
            font-family: monospace;
        }
        canvas {
            background: #0f3460;
            margin: 20px auto;
            display: block;
            border-radius: 10px;
        }
        .status {
            text-align: center;
            color: #4ecca3;
            font-size: 18px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏎️ F1Tenth Platooning Simulation Dashboard</h1>
        <div class="status" id="status">● Live</div>
        
        <canvas id="track" width="800" height="600"></canvas>
        
        <div class="car-container">
            <div class="car-card">
                <div class="car-title">🏎️ Lead Car (racecar)</div>
                <div class="data-row">
                    <span class="label">Position X:</span>
                    <span class="value" id="car1-x">0.00</span>
                </div>
                <div class="data-row">
                    <span class="label">Position Y:</span>
                    <span class="value" id="car1-y">0.00</span>
                </div>
                <div class="data-row">
                    <span class="label">Velocity X:</span>
                    <span class="value" id="car1-vx">0.00</span>
                </div>
                <div class="data-row">
                    <span class="label">Velocity Y:</span>
                    <span class="value" id="car1-vy">0.00</span>
                </div>
            </div>
            
            <div class="car-card">
                <div class="car-title">🏎️ Follower Car (racecar2)</div>
                <div class="data-row">
                    <span class="label">Position X:</span>
                    <span class="value" id="car2-x">0.00</span>
                </div>
                <div class="data-row">
                    <span class="label">Position Y:</span>
                    <span class="value" id="car2-y">0.00</span>
                </div>
                <div class="data-row">
                    <span class="label">Velocity X:</span>
                    <span class="value" id="car2-vx">0.00</span>
                </div>
                <div class="data-row">
                    <span class="label">Velocity Y:</span>
                    <span class="value" id="car2-vy">0.00</span>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const canvas = document.getElementById('track');
        const ctx = canvas.getContext('2d');
        
        function drawTrack() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw track outline
            ctx.strokeStyle = '#4ecca3';
            ctx.lineWidth = 3;
            ctx.strokeRect(50, 50, 700, 500);
            
            // Draw grid
            ctx.strokeStyle = '#16213e';
            ctx.lineWidth = 1;
            for (let i = 50; i < 800; i += 50) {
                ctx.beginPath();
                ctx.moveTo(i, 50);
                ctx.lineTo(i, 550);
                ctx.stroke();
            }
            for (let i = 50; i < 600; i += 50) {
                ctx.beginPath();
                ctx.moveTo(50, i);
                ctx.lineTo(750, i);
                ctx.stroke();
            }
        }
        
        function drawCar(x, y, color, label) {
            // Scale and offset position for canvas
            const canvasX = 400 + x * 50;
            const canvasY = 300 - y * 50;
            
            // Draw car
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(canvasX, canvasY, 15, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw label
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText(label, canvasX - 20, canvasY - 20);
        }
        
        function updateData() {
            fetch('/data')
                .then(response => response.json())
                .then(data => {
                    // Update car 1
                    document.getElementById('car1-x').textContent = data.racecar.x.toFixed(2);
                    document.getElementById('car1-y').textContent = data.racecar.y.toFixed(2);
                    document.getElementById('car1-vx').textContent = data.racecar.vx.toFixed(2);
                    document.getElementById('car1-vy').textContent = data.racecar.vy.toFixed(2);
                    
                    // Update car 2
                    document.getElementById('car2-x').textContent = data.racecar2.x.toFixed(2);
                    document.getElementById('car2-y').textContent = data.racecar2.y.toFixed(2);
                    document.getElementById('car2-vx').textContent = data.racecar2.vx.toFixed(2);
                    document.getElementById('car2-vy').textContent = data.racecar2.vy.toFixed(2);
                    
                    // Redraw track and cars
                    drawTrack();
                    drawCar(data.racecar.x, data.racecar.y, '#ff6b6b', 'Lead');
                    drawCar(data.racecar2.x, data.racecar2.y, '#4ecdc4', 'Follow');
                });
        }
        
        // Initial draw
        drawTrack();
        
        // Update every 100ms
        setInterval(updateData, 100);
    </script>
</body>
</html>
'''

def model_states_callback(msg):
    """Process Gazebo model states"""
    try:
        for i, name in enumerate(msg.name):
            if name == 'racecar' or name == 'racecar2':
                car_data[name]['x'] = msg.pose[i].position.x
                car_data[name]['y'] = msg.pose[i].position.y
                car_data[name]['vx'] = msg.twist[i].linear.x
                car_data[name]['vy'] = msg.twist[i].linear.y
    except Exception as e:
        rospy.logerr(f"Error processing model states: {e}")

def ros_thread():
    """ROS subscriber thread"""
    rospy.init_node('web_dashboard', anonymous=True)
    rospy.Subscriber('/gazebo/model_states', ModelStates, model_states_callback)
    rospy.spin()

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/data')
def data():
    return json.dumps(car_data)

if __name__ == '__main__':
    # Start ROS subscriber in separate thread
    ros_thread_obj = threading.Thread(target=ros_thread, daemon=True)
    ros_thread_obj.start()
    
    # Start Flask web server
    print("🌐 Starting web dashboard on http://localhost:5000")
    print("   Open this URL in your browser to see the simulation!")
    app.run(host='0.0.0.0', port=5000, debug=False)

