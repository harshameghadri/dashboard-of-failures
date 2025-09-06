# Dashboard of Failures 📊

A transparent, public dashboard for tracking job applications, rejections, and the occasional success. Built with honesty, humor, and hope.

## ✨ Features

- **Real-time Data**: Syncs with Google Sheets for easy data entry
- **Beautiful Visualizations**: Interactive pie charts and sortable tables
- **Key Metrics**: Track total applications, rejections, ghosting, and success rate
- **Wall of Notable Applications**: Highlight special rejections or successes
- **Dark Theme**: Easy on the eyes during those late-night job hunt sessions
- **Mobile Responsive**: View your failures on any device
- **Auto-refresh**: Data updates every 10 minutes via ISR

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **UI Components**: Shadcn/ui for modern, accessible components
- **Charts**: Recharts for data visualization
- **Table**: TanStack Table for sorting and filtering
- **Data Source**: Google Sheets API
- **Deployment**: Vercel-ready with ISR

## 📋 Setup Instructions

### 1. Google Sheets Setup

1. Create a new Google Sheet with the following columns (in this exact order):

   | company | position | dateApplied | status | lastUpdate | notes | highlight |
   |---------|----------|-------------|---------|------------|-------|-----------|
   | TechCorp | Frontend Dev | 2025-09-01 | Rejected | 2025-09-05 | Failed technical | TRUE |

2. **Column Details**:
   - `company`: Company name (string)
   - `position`: Job title (string)  
   - `dateApplied`: Application date (YYYY-MM-DD format)
   - `status`: One of: `Applied`, `Screening`, `Interviewing`, `Offer`, `Rejected`, `Ghosted`
   - `lastUpdate`: Last update date (YYYY-MM-DD format)
   - `notes`: Additional notes (string)
   - `highlight`: `TRUE` to feature on Wall of Notable Applications, `FALSE` otherwise

### 2. Google Cloud Platform Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**
4. Go to **APIs & Services > Credentials**
5. Click **Create Credentials > Service Account**
6. Fill in the service account details and create
7. Click on the created service account
8. Go to **Keys** tab > **Add Key > Create New Key**
9. Choose **JSON** format and download the key file
10. Share your Google Sheet with the `client_email` from the JSON file (give "Viewer" permission)

### 3. Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your environment variables in `.env.local`:
   ```env
   SPREADSHEET_ID=your_actual_spreadsheet_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com  
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----"
   ```

   **Finding your Spreadsheet ID**: It's in your Google Sheets URL:
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### 4. Local Development

#### Option A: Demo Mode (Quickest)
No Google Sheets setup required! The app includes demo data.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the demo dashboard

#### Option B: With Your Own Google Sheets Data

1. Complete the Google Cloud Platform setup above
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in your actual values in `.env.local`
4. Run the development server:
   ```bash
   npm run dev
   ```

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `SPREADSHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`  
   - `GOOGLE_PRIVATE_KEY` (⚠️ Replace newlines with `\n`)
4. Deploy!

## 🎨 Customization

### Theme Colors
Edit the primary color in `styles/globals.css`:
```css
:root {
  --primary: 142 76% 36%; /* Current: Green */
  /* Try: */
  /* --primary: 217 91% 60%; /* Blue */
  /* --primary: 262 83% 58%; /* Purple */ 
}
```

### Status Colors
Modify `STATUS_COLORS` in `pages/index.tsx` to change pie chart colors.

### Motivational Quote
Update the motivational card content in the main dashboard component.

## 📊 Data Management Tips

1. **Consistent Status Values**: Always use exact values (`Applied`, `Rejected`, etc.)
2. **Date Format**: Use YYYY-MM-DD for proper sorting
3. **Highlight Sparingly**: Only mark truly notable applications as `TRUE`
4. **Regular Updates**: Keep `lastUpdate` current for accurate ghosting detection
5. **Detailed Notes**: Great for reflecting on feedback and patterns

## 🤝 Contributing

This is a personal project, but feel free to:
- Fork and customize for your own job hunt
- Submit issues for bugs or feature requests
- Share your own "Dashboard of Failures" stories

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

## 💡 Inspiration

Created out of the frustration and reality of modern job hunting. If this dashboard helps even one person feel less alone in their job search journey, it's worth it.

Remember: Every rejection is just redirecting you toward your perfect opportunity. Keep going! 🚀

---

*"The only real failure is the failure to try, and the measure of success is how we cope with disappointment."* - Deborah Moggach