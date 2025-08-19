# 🧪 Creating Your First Study - Step by Step Tutorial

Welcome to your first study creation experience with ResearchHub! This tutorial will guide you through creating a complete user research study from start to finish.

## 🎯 What You'll Build

By the end of this tutorial, you'll have created a professional user research study with:
- Welcome screen with study introduction
- Multiple question types (open-ended, rating scales, multiple choice)
- Thank you screen with completion message
- Live participant link ready to share

## ⏱️ Time Required
**15-20 minutes** for a complete study

## 📋 Prerequisites

- ResearchHub researcher account (see [Getting Started](../getting-started/README.md))
- Basic understanding of your research goals
- Target audience identified

## 🚀 Step 1: Access the Study Builder

### 1.1 Navigate to Study Creation

1. **Login** to your ResearchHub account at [https://researchhub-saas.vercel.app](https://researchhub-saas.vercel.app)
2. **Click** "Create New Study" from your dashboard
3. **Choose** "Start from Scratch" for this tutorial

### 1.2 Study Builder Interface Overview

The study builder consists of three main areas:

```
┌─────────────────┬──────────────────────┬─────────────────┐
│   Block Library │    Study Canvas      │  Block Settings │
│                 │                      │                 │
│   📖 Welcome    │  ┌─────────────────┐ │   Title: [...]  │
│   ❓ Question   │  │  Welcome Block  │ │   Desc: [...]   │
│   📊 Rating     │  └─────────────────┘ │   Required: ☑   │
│   📝 Text       │  ┌─────────────────┐ │                 │
│   ✅ Choice     │  │  Question Block │ │                 │
│   🎉 Thank You  │  └─────────────────┘ │                 │
│                 │                      │                 │
└─────────────────┴──────────────────────┴─────────────────┘
```

## 📝 Step 2: Create Your Welcome Screen

### 2.1 Add Welcome Block

1. **Drag** the "Welcome Screen" block from the library to the canvas
2. **Configure** the welcome block with:

```markdown
Title: Welcome to Our User Experience Study
Description: Help us improve our mobile app by sharing your thoughts and experiences. This study takes about 5-7 minutes to complete.

Instructions:
- Answer all questions honestly
- There are no right or wrong answers
- You can skip optional questions
- Your responses are completely anonymous
```

### 2.2 Welcome Block Settings

- **Study Title**: "Mobile App UX Feedback Study"
- **Estimated Time**: "5-7 minutes"
- **Participant Instructions**: Include any specific guidance
- **Privacy Notice**: Explain data usage and anonymity

## ❓ Step 3: Add Research Questions

### 3.1 Open-Ended Question Block

**Purpose**: Gather detailed qualitative feedback

1. **Drag** "Open Question" block to canvas
2. **Configure**:
   - **Title**: "Tell us about your experience"
   - **Question**: "Describe your overall experience using our mobile app in the past week"
   - **Placeholder**: "Please share your thoughts, frustrations, or positive experiences..."
   - **Required**: Yes
   - **Character Limit**: 500 characters

### 3.2 Opinion Scale Block

**Purpose**: Quantify user satisfaction

1. **Add** "Opinion Scale" block
2. **Configure**:
   - **Title**: "Rate your satisfaction"
   - **Question**: "How satisfied are you with the app's performance?"
   - **Scale Type**: 1-10 (1 = Very Dissatisfied, 10 = Very Satisfied)
   - **Labels**: Custom labels for clarity
   - **Required**: Yes

### 3.3 Multiple Choice Block

**Purpose**: Gather specific categorical data

1. **Add** "Multiple Choice" block
2. **Configure**:
   - **Title**: "Primary usage patterns"
   - **Question**: "Which features do you use most frequently? (Select all that apply)"
   - **Options**:
     - Dashboard/Home screen
     - Search functionality
     - User profile
     - Settings
     - Notifications
     - Other (please specify)
   - **Allow Multiple**: Yes
   - **Required**: Yes

### 3.4 Simple Input Block

**Purpose**: Collect specific demographic or contextual data

1. **Add** "Simple Input" block
2. **Configure**:
   - **Title**: "Device information"
   - **Question**: "What type of device do you primarily use our app on?"
   - **Input Type**: Dropdown
   - **Options**: 
     - iPhone
     - Android Phone
     - iPad
     - Android Tablet
     - Other
   - **Required**: No

## 🎨 Step 4: Customize Advanced Settings

### 4.1 Conditional Logic (Optional)

Add smart branching based on responses:

```javascript
// Example: Show follow-up question only if satisfaction is low
if (satisfaction_rating <= 5) {
  show_block("improvement_suggestions");
}
```

### 4.2 AI-Powered Features

Enable AI assistance for:
- **Smart Follow-ups**: Automatic follow-up questions based on responses
- **Response Analysis**: Real-time sentiment analysis
- **Content Suggestions**: AI-generated question improvements

## 🎉 Step 5: Add Thank You Screen

### 5.1 Thank You Block Configuration

1. **Add** "Thank You" block (automatically added at the end)
2. **Customize**:
   - **Title**: "Thank you for your feedback!"
   - **Message**: "Your insights help us improve the app experience for everyone"
   - **Next Steps**: "We'll analyze all responses and share updates in our monthly newsletter"
   - **Contact Info**: Include email for questions
   - **Social Sharing**: Enable participants to share the study

### 5.2 Completion Actions

Configure what happens after completion:
- **Redirect URL**: Optional redirect to your website
- **Download Results**: Provide summary to participants
- **Follow-up Survey**: Link to additional research
- **Incentive Information**: Details about rewards/compensation

## 🔍 Step 6: Preview and Test

### 6.1 Preview Mode

1. **Click** "Preview Study" button
2. **Experience** the complete participant journey
3. **Test** all question types and validation
4. **Verify** mobile responsiveness

### 6.2 Test Checklist

Ensure your study meets quality standards:

- [ ] Welcome screen clearly explains the study purpose
- [ ] All questions are clear and unambiguous  
- [ ] Required questions are properly marked
- [ ] Validation rules work correctly
- [ ] Thank you screen provides appropriate closure
- [ ] Mobile experience is optimized
- [ ] Estimated time is accurate

## 🚀 Step 7: Publish Your Study

### 7.1 Final Review

1. **Study Information**:
   - Title: Descriptive and professional
   - Description: Clear purpose and expectations
   - Tags: Relevant categories for organization

2. **Participant Settings**:
   - Target Audience: Define your ideal participants
   - Sample Size: Set your target number of responses
   - Duration: Study availability period

3. **Privacy Settings**:
   - Data Collection: Specify what data you collect
   - Anonymity: Confirm participant privacy protection
   - Data Retention: Set how long you'll keep responses

### 7.2 Publishing Process

1. **Click** "Publish Study"
2. **Review** the publication checklist
3. **Confirm** all settings are correct
4. **Generate** participant link

### 7.3 Share Your Study

**Participant Link**: `https://researchhub-saas.vercel.app/study/your-study-id`

**Sharing Options**:
- **Email**: Direct invitation to participants
- **Social Media**: Share on platforms where your audience is active
- **Website Embed**: Add to your website or blog
- **QR Code**: For in-person or print materials

## 📊 Step 8: Monitor Results

### 8.1 Real-Time Dashboard

Track your study performance:
- **Response Count**: Number of completed studies
- **Completion Rate**: Percentage who finish vs. start
- **Average Time**: Actual completion time
- **Drop-off Points**: Where participants exit

### 8.2 Response Analysis

**AI-Powered Insights**:
- Automatic sentiment analysis of open responses
- Key theme extraction from qualitative data
- Correlation analysis between different questions
- Actionable recommendations based on data

**Manual Analysis**:
- Export data in CSV/Excel format
- Create custom reports and visualizations
- Compare with previous studies
- Share findings with your team

## 🎯 Best Practices for Success

### Question Design
1. **Keep it Simple**: One concept per question
2. **Avoid Leading Questions**: Stay neutral in wording
3. **Use Clear Language**: Avoid jargon or technical terms
4. **Logical Flow**: Questions should build naturally

### Participant Experience
1. **Set Expectations**: Clear time estimates and purpose
2. **Progress Indicators**: Show completion percentage
3. **Mobile Optimization**: Test on various devices
4. **Accessible Design**: Follow accessibility guidelines

### Data Quality
1. **Validation Rules**: Prevent incomplete or invalid responses
2. **Quality Checks**: Monitor for spam or low-quality responses
3. **Balanced Questions**: Mix different question types
4. **Pilot Testing**: Test with a small group first

## 🚀 What's Next?

### Continue Learning
- **[AI Features Tutorial](../ai-features/ai-overview.md)**: Learn about AI-powered insights
- **[Advanced Study Types](advanced-studies.md)**: Explore specialized research methods
- **[Participant Management](../participant-flow/overview.md)**: Optimize recruitment and engagement

### Advanced Features to Explore
- **Template Creation**: Save your study as a reusable template
- **Team Collaboration**: Invite colleagues to collaborate
- **Integration Setup**: Connect with your existing tools
- **Advanced Analytics**: Deep-dive into response patterns

## 🆘 Troubleshooting

### Common Issues

**Study Won't Publish**:
- Check that all required blocks are configured
- Ensure at least one question is marked as required
- Verify study title and description are complete

**Low Response Rates**:
- Review your study length (aim for 5-10 minutes)
- Improve your study description and incentives
- Check your participant recruitment strategy

**Technical Problems**:
- Clear browser cache and cookies
- Try a different browser or device
- Check internet connection stability
- Contact support if issues persist

### Getting Help
- **Documentation**: Browse our [complete guides](../../how-to-guides/)
- **Community**: Join our user community for tips
- **Support**: Contact technical support for assistance
- **Tutorials**: Watch video tutorials on our YouTube channel

---

**Congratulations!** You've successfully created your first ResearchHub study. You now have the skills to conduct professional user research and gather valuable insights from your audience.

**Next Tutorial**: [Using AI Features](../ai-features/ai-overview.md)
