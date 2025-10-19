# F1Tenth Platooning Simulation - Quick Start Guide

## 🏎️ Your Simulation is Ready!

The Docker container is already running with 2 F1Tenth racecars on the Porto track.

---

## 🚀 How to Run

### Option 1: Interactive Control (Recommended)

**In your Mac Terminal:**

```bash
cd /Users/joker2307/Desktop/Platooning-F1Tenth
./enter_sim.sh
```

**Inside the container, run:**

```bash
# Start the lead car (autonomous driving)
rosrun race disparity_extender_vanderbilt.py
```

The follower car is already running!

---

### Option 2: Start Fresh Simulation

```bash
cd /Users/joker2307/Desktop/Platooning-F1Tenth
./start_sim.sh
./enter_sim.sh
```

---

## 📊 Monitor Without GUI

```bash
cd /Users/joker2307/Desktop/Platooning-F1Tenth
./monitor_cars.sh
```

---

## 🎮 Available Commands (Inside Container)

### Control Commands:
- `rosrun race disparity_extender_vanderbilt.py` - Lead car autonomous driving
- `rosrun race follow_lead_gen.py racecar racecar2` - Follower algorithm
- `rosrun race wall_follower.py` - Wall following algorithm
- `rosrun race keyboard_gen.py racecar` - Manual keyboard control

### Monitoring Commands:
- `rostopic echo /gazebo/model_states` - See all car positions
- `rostopic echo /racecar/scan` - See LIDAR data
- `rostopic echo /racecar/odom` - See odometry (position/velocity)
- `rosnode list` - List all running nodes

---

## 🛑 Stop Simulation

```bash
docker stop f1tenth_gui
```

---

## ⚠️ Important Notes

1. **All ROS commands must run INSIDE the Docker container** (use `./enter_sim.sh`)
2. **Don't run ROS commands on your Mac directly** - they won't work
3. **The simulation runs in headless mode** - no 3D graphics, but physics works
4. **Each algorithm needs its own terminal** - use `./enter_sim.sh` multiple times

---

## 🏁 What's Running Now

✅ Gazebo physics simulation
✅ 2 F1Tenth racecars (racecar and racecar2)
✅ Porto race track
✅ Follower algorithm (racecar2 following racecar)
⏳ Waiting for lead car controller to start

---

## 🎯 Next Step

**Run this in your Mac Terminal NOW:**

```bash
cd /Users/joker2307/Desktop/Platooning-F1Tenth && ./enter_sim.sh
```

Then start the lead car:

```bash
rosrun race disparity_extender_vanderbilt.py
```

Enjoy! 🏎️💨

