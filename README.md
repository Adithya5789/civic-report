# CivicReport 🏛️

CivicReport is a modern, full-stack platform designed to bridge the gap between citizens and local government. It allows citizens to report civic issues (like potholes, garbage, or water leaks) and provides an administrative portal for government officials to manage, track, and resolve these issues efficiently.

## 🚀 Key Features

### Citizen Portal
- **Interactive Map**: View and report issues directly on an interactive Leaflet map.
- **Issue Tracking**: Submit reports with photos, categories (Pothole, Water Leakage, etc.), and priority levels.
- **Real-time Updates**: Monitor the status of reported issues (Pending, In Progress, Resolved).

### Admin Portal
- **Command Dashboard**: Overview of system analytics and issue distribution.
- **Issue Management**: Change status, assign workers, and add administrative notes.
- **Database Inspector**: A powerful, spreadsheet-like view of all backend data for raw data management.
- **Strict Security**: Administrative access is strictly enforced for authorized personnel only.

## 🛠️ Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons.
- **Backend**: Node.js (Express), CommonJS.
- **Database**: MySQL.
- **Integrations**: Leaflet (Maps), Recharts (Analytics).

## 💻 Local Setup

1.  **Clone the Repository**:
    ```bash
    git clone [repository-url]
    cd civic-report
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Database Configuration**:
    - Import the provided `schema.sql` into your MySQL server.
    - Create a `.env` file in the root directory with your database credentials:
      ```env
      DB_HOST=localhost
      DB_USER=your_user
      DB_PASSWORD=your_password
      DB_NAME=civic_report
      PORT=3010
      ```

4.  **Run the Application**:
    - **Development Mode**: `npm run dev`
    - **Unified Server** (Frontend + Backend): `node server.cjs`

## 📊 Database Inspector
Admins can access the **Database Inspector** to view data in a filtered tabular form, including:
- **Traking id**
- **User name**
- **Issue**
- **Worker**
- **Status**
- **Issed & Solved Dates**

---

