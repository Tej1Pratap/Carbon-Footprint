# CSR & Personal Carbon Footprint Monitoring Platform

A comprehensive, full-stack web application designed to help both individuals and corporate employees track, analyze, and reduce their carbon footprints. It also provides powerful Corporate Social Responsibility (CSR) management tools for organizational administrators.

## 🚀 Features

### For Individuals & Employees (Personal Tracking)
* **Real-time Dashboard:** Track today's footprint, monthly emissions, and your overall carbon score with beautiful Recharts visualizations.
* **Activity Logging:** Log daily activities across multiple categories (Electricity, Transport, Food, Shopping, Waste).
* **Multi-Line Trend Analytics:** Compare your emission trends from this week versus last week dynamically.
* **Sustainability Goals:** Set monthly reduction targets and watch your progress bar update in real-time.
* **Gamification:** Earn badges for consecutive logging and climb the organization's leaderboard.
* **AI Recommendations:** Receive tailored, daily tips on how to reduce your specific emissions.

### For Organizations (CSR Management)
* **Corporate Dashboard:** High-level analytics to view the entire organization's carbon footprint and progress toward net-zero.
* **Employee Management:** Manage departments, view employee activities, and assign custom sustainability goals.
* **Scope Analytics:** Categorize emissions into Scope 1, Scope 2, and Scope 3 according to global standards.
* **Help & Support Ticketing:** Dedicated support channels for employees to contact CSR Admins.

## 🛠️ Technology Stack
* **Frontend:** React, Vite, Tailwind CSS, Recharts (for data visualization), Lucide React (for iconography).
* **Backend:** Java 17, Spring Boot, Spring Security (JWT Authentication), Hibernate/JPA.
* **Database:** MySQL.
* **Architecture:** RESTful APIs with a robust Service-Controller separation.

## 📋 Getting Started

### Prerequisites
* Node.js (v18+)
* Java 17+
* MySQL Server (running on default port 3306)
* Maven

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tej1Pratap/Carbon-Footprint.git
   cd Carbon-Footprint
   ```

2. **Backend Setup:**
   * Create a MySQL database named `carbon_footprint`.
   * Open `backend/src/main/resources/application.properties` and update your MySQL username and password.
   * Navigate to the `backend` folder and run the Spring Boot application:
     ```bash
     cd backend
     ./mvnw spring-boot:run
     ```

3. **Frontend Setup:**
   * Open a new terminal and navigate to the `frontend` folder.
   * Install the dependencies and start the Vite development server:
     ```bash
     cd frontend
     npm install
     npm run dev
     ```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is open source and available under the [MIT License](LICENSE).
