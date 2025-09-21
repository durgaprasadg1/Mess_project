# 🥘 MessMate 

A modern, full-stack mess ordering app built with Node.js, Express, MongoDB, and EJS.
Users can browse messes, place orders, track order status, and manage their profile—all in one simple, responsive interface.

# 🚀 Features 

Mess Listing & Details: Browse multiple messes, view menus and prices.

User Authentication: Secure login & registration.

Place Orders: Select mess, submit order, and track placed time (formatted in IST).

Order History & Tracking: View all previous orders with status (Pending / Confirmed / Delivered).

Profile Dashboard: Manage account, see past orders.

Responsive UI: Mobile-first design using Tailwind CSS.

Admin Features (if enabled): Mess owners can manage listings and update orders.

# 🛠️ Tech Stack 

# Frontend

EJS (templating engine)

BootStrap for styling

Vanilla JS for interactivity

# Backend

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js) 

Express.js

MongoDB with Mongoose

# Deployment

Hosted on [Render.com]

Environment variables for MongoDB URI and session secrets

📦 Installation
# Clone the repo
git clone https://github.com/durgaprasadg1/Mess_project.git

cd mess-project

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
Fill in your MongoDB URI and session secret

# Run development server
node index.js


Visit: http://localhost:3000

 # ✨ Usage 
 

Register or log in to your account.

Browse available messes.

Place orders and see status in Placed On column.

View past orders in profile.

Admin (if enabled) can update status of pending orders.

# 🎯 Future Enhancements 
Feature	Status
Admin dashboard	Planned
Real-time notifications	Upcoming
Export order history	Roadmap
Email / SMS alerts	Idea stage
# 📄 License

MIT License – free to use, modify, and distribute.

# 💡 Credits

Node.js & Express

MongoDB & Mongoose

BootStrap 

EJS
# 🤝 Contributing

Contributions, feedback, or improvements (especially UI or feature suggestions) are welcome! Please open an issue or fork the project and submit a pull request.
