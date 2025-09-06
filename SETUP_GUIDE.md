# 🚀 Complete Setup Guide for Dashboard of Failures

## 📋 Quick Start Checklist

- [ ] Google Cloud Project created
- [ ] Google Sheets API enabled
- [ ] Service Account created and JSON key downloaded
- [ ] Google Sheet shared with service account
- [ ] Environment variables configured
- [ ] App running locally
- [ ] GitHub repository created
- [ ] Deployed to Vercel

## 🔧 Step 1: Google Cloud Platform Setup

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" (or select existing project)
3. Name it "dashboard-of-failures" or similar
4. Click "Create"

### 1.2 Enable Google Sheets API
1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### 1.3 Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in details:
   - **Name**: `dashboard-service-account`
   - **Description**: `Service account for Dashboard of Failures app`
4. Click "Create and Continue"
5. Skip role assignment (click "Continue")
6. Click "Done"

### 1.4 Generate Service Account Key
1. Click on your newly created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Select "JSON" and click "Create"
5. **Save this JSON file securely** - you'll need it!

## 📊 Step 2: Google Sheet Configuration

### 2.1 Share Your Sheet
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1_vA2svN_NlNyfy1L9AHuumzMX1oLurI_HMeLLNHdeJ0/edit
2. Click "Share" button (top right)
3. Add the `client_email` from your JSON file (looks like `xxx@xxx.iam.gserviceaccount.com`)
4. Set permission to "Viewer"
5. Click "Send"

### 2.2 Verify Sheet Structure
Your sheet should have these columns in row 1:
```
A: company
B: position  
C: dateApplied
D: status
E: lastUpdate
F: notes
G: highlight
```

## 💻 Step 3: Local Development Setup

### 3.1 Environment Variables
1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your values:
   ```env
   SPREADSHEET_ID=1_vA2svN_NlNyfy1L9AHuumzMX1oLurI_HMeLLNHdeJ0
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-actual-private-key-here\n-----END PRIVATE KEY-----"
   ```

   **Finding your values:**
   - `SPREADSHEET_ID`: Already set to your sheet ID
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: `client_email` from your JSON file
   - `GOOGLE_PRIVATE_KEY`: `private_key` from your JSON file

### 3.2 Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should see your actual data!

## 🐙 Step 4: GitHub Repository Setup

### 4.1 Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Dashboard of Failures"
```

### 4.2 Create GitHub Repository
1. Go to [GitHub](https://github.com/harshameghadri)
2. Click "New repository"
3. Name it "dashboard-of-failures"
4. Make it **Public** (required for Vercel free tier)
5. Don't initialize with README (we already have files)
6. Click "Create repository"

### 4.3 Push to GitHub
```bash
git remote add origin https://github.com/harshameghadri/dashboard-of-failures.git
git branch -M main
git push -u origin main
```

## 🚀 Step 5: Vercel Deployment

### 5.1 Connect to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `dashboard-of-failures` repository
5. Click "Deploy"

### 5.2 Add Environment Variables
1. In Vercel project dashboard, go to "Settings" > "Environment Variables"
2. Add these variables:
   - `SPREADSHEET_ID`: `1_vA2svN_NlNyfy1L9AHuumzMX1oLurI_HMeLLNHdeJ0`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Your service account email
   - `GOOGLE_PRIVATE_KEY`: Your private key (**Important**: Replace actual newlines with `\n`)

### 5.3 Redeploy
1. Go to "Deployments" tab
2. Click "Redeploy" on the latest deployment
3. Wait for completion

Your dashboard should now be live at `https://dashboard-of-failures-xxx.vercel.app`!

## 🔍 Troubleshooting

### Common Issues:

1. **"Permission denied"**: Make sure you shared the Google Sheet with your service account email
2. **"Spreadsheet not found"**: Check your `SPREADSHEET_ID` is correct
3. **"Invalid private key"**: Ensure newlines are properly escaped as `\n` in Vercel
4. **Build errors**: Check all environment variables are set in Vercel

### Testing Your Setup:
```bash
# Check if environment variables are loaded
npm run dev

# Check API endpoint directly
curl http://localhost:3000/api/get-applications
```

## 📝 Next Steps

1. **Customize the app**: Update colors, messaging, add more features
2. **Add more data**: Keep updating your Google Sheet
3. **Share your journey**: Your dashboard is now public and shareable!
4. **Monitor performance**: Use Vercel analytics to track visitors

## 🎯 Success Criteria

✅ **Local Success**: Dashboard loads at http://localhost:3000 with your sheet data  
✅ **Deployment Success**: Dashboard accessible at your Vercel URL  
✅ **Data Success**: Your applications show up with correct statuses and notes  
✅ **Feature Success**: Sorting works, charts display, Wall of Notable Applications populated  

**You're all set!** Your Dashboard of Failures is now live and automatically syncing with your Google Sheet every 10 minutes! 🎉