/**
 * Notion Product Management Hub Setup
 * Creates and configures Notion databases for ResearchHub product management
 */

const NOTION_DATABASE_SCHEMAS = {
  // 1. Features & Requirements Database
  features: {
    name: "🚀 Features & Requirements",
    description: "Complete feature lifecycle management and requirements tracking",
    properties: {
      "Feature Name": {
        type: "title",
        title: {}
      },
      "Status": {
        type: "select",
        select: {
          options: [
            { name: "📋 Backlog", color: "gray" },
            { name: "🔍 Research", color: "blue" },
            { name: "📝 Planning", color: "yellow" },
            { name: "⚡ In Progress", color: "orange" },
            { name: "🧪 Testing", color: "purple" },
            { name: "✅ Done", color: "green" },
            { name: "❌ Cancelled", color: "red" }
          ]
        }
      },
      "Priority": {
        type: "select",
        select: {
          options: [
            { name: "🔥 P0 - Critical", color: "red" },
            { name: "⚡ P1 - High", color: "orange" },
            { name: "📋 P2 - Medium", color: "yellow" },
            { name: "💭 P3 - Low", color: "gray" }
          ]
        }
      },
      "Epic": {
        type: "select",
        select: {
          options: [
            { name: "🎯 Study Builder", color: "blue" },
            { name: "📊 Analytics", color: "green" },
            { name: "👥 Collaboration", color: "purple" },
            { name: "💳 Payments", color: "orange" },
            { name: "🔧 Platform", color: "gray" }
          ]
        }
      },
      "Assignee": {
        type: "people",
        people: {}
      },
      "Sprint": {
        type: "relation",
        relation: {
          database_id: "SPRINT_DATABASE_ID", // Will be replaced after sprint DB creation
          type: "dual_property"
        }
      },
      "Story Points": {
        type: "number",
        number: { format: "number" }
      },
      "Requirements": {
        type: "rich_text",
        rich_text: {}
      },
      "Acceptance Criteria": {
        type: "rich_text", 
        rich_text: {}
      },
      "Research Study": {
        type: "url",
        url: {}
      },
      "Created Date": {
        type: "created_time",
        created_time: {}
      },
      "Last Updated": {
        type: "last_edited_time",
        last_edited_time: {}
      }
    }
  },

  // 2. Sprint Management Database
  sprints: {
    name: "🏃 Sprint Management", 
    description: "Agile sprint planning, tracking, and retrospectives",
    properties: {
      "Sprint Name": {
        type: "title",
        title: {}
      },
      "Sprint Number": {
        type: "number",
        number: { format: "number" }
      },
      "Status": {
        type: "select",
        select: {
          options: [
            { name: "📅 Planning", color: "blue" },
            { name: "🏃 Active", color: "green" },
            { name: "🔍 Review", color: "yellow" },
            { name: "📊 Retrospective", color: "purple" },
            { name: "✅ Complete", color: "gray" }
          ]
        }
      },
      "Start Date": {
        type: "date",
        date: {}
      },
      "End Date": {
        type: "date", 
        date: {}
      },
      "Sprint Goal": {
        type: "rich_text",
        rich_text: {}
      },
      "Team Capacity": {
        type: "number",
        number: { format: "number" }
      },
      "Planned Velocity": {
        type: "number",
        number: { format: "number" }
      },
      "Actual Velocity": {
        type: "number",
        number: { format: "number" }
      },
      "Features": {
        type: "relation",
        relation: {
          database_id: "FEATURES_DATABASE_ID", // Will be replaced
          type: "dual_property"
        }
      }
    }
  },

  // 3. User Research Database
  research: {
    name: "🔬 User Research",
    description: "Research insights and feature validation from ResearchHub studies",
    properties: {
      "Study Name": {
        type: "title",
        title: {}
      },
      "Study Type": {
        type: "select",
        select: {
          options: [
            { name: "🧪 A/B Test", color: "blue" },
            { name: "📝 User Interview", color: "green" },
            { name: "📊 Survey", color: "yellow" },
            { name: "🎯 5-Second Test", color: "orange" },
            { name: "🗂️ Card Sort", color: "purple" },
            { name: "🌳 Tree Test", color: "gray" }
          ]
        }
      },
      "Status": {
        type: "select",
        select: {
          options: [
            { name: "📋 Planned", color: "gray" },
            { name: "🏃 Running", color: "blue" },
            { name: "📊 Analyzing", color: "yellow" },
            { name: "✅ Complete", color: "green" },
            { name: "❌ Cancelled", color: "red" }
          ]
        }
      },
      "ResearchHub URL": {
        type: "url",
        url: {}
      },
      "Participants": {
        type: "number",
        number: { format: "number" }
      },
      "Key Insights": {
        type: "rich_text",
        rich_text: {}
      },
      "Impact Score": {
        type: "select",
        select: {
          options: [
            { name: "🔥 Critical Impact", color: "red" },
            { name: "⚡ High Impact", color: "orange" },
            { name: "📋 Medium Impact", color: "yellow" },
            { name: "💭 Low Impact", color: "gray" }
          ]
        }
      },
      "Related Features": {
        type: "relation",
        relation: {
          database_id: "FEATURES_DATABASE_ID", // Will be replaced
          type: "dual_property"
        }
      },
      "Research Date": {
        type: "date",
        date: {}
      }
    }
  },

  // 4. Release Planning Database
  releases: {
    name: "🚀 Release Planning",
    description: "Version management and deployment tracking",
    properties: {
      "Release Name": {
        type: "title",
        title: {}
      },
      "Version": {
        type: "rich_text",
        rich_text: {}
      },
      "Release Type": {
        type: "select",
        select: {
          options: [
            { name: "🔥 Hotfix", color: "red" },
            { name: "🐛 Patch", color: "yellow" },
            { name: "✨ Minor", color: "blue" },
            { name: "🚀 Major", color: "green" }
          ]
        }
      },
      "Status": {
        type: "select",
        select: {
          options: [
            { name: "📋 Planning", color: "gray" },
            { name: "⚡ Development", color: "blue" },
            { name: "🧪 Testing", color: "yellow" },
            { name: "🚀 Ready", color: "orange" },
            { name: "✅ Deployed", color: "green" },
            { name: "❌ Cancelled", color: "red" }
          ]
        }
      },
      "Target Date": {
        type: "date",
        date: {}
      },
      "Actual Date": {
        type: "date",
        date: {}
      },
      "Features": {
        type: "relation",
        relation: {
          database_id: "FEATURES_DATABASE_ID", // Will be replaced
          type: "dual_property"
        }
      },
      "Release Notes": {
        type: "rich_text",
        rich_text: {}
      },
      "Deployment Environment": {
        type: "select",
        select: {
          options: [
            { name: "💻 Local", color: "gray" },
            { name: "🧪 Staging", color: "yellow" },
            { name: "🚀 Production", color: "green" }
          ]
        }
      }
    }
  }
};

/**
 * Automation Workflow Configurations
 */
const AUTOMATION_WORKFLOWS = {
  // ResearchHub Study Completion → Feature Creation
  studyToFeature: {
    trigger: "ResearchHub study completion webhook",
    action: "Create or update feature in Notion",
    mapping: {
      studyName: "Feature Name",
      studyResults: "Requirements", 
      userInsights: "Research Study",
      impactScore: "Priority"
    }
  },

  // Sprint Planning → Feature Assignment
  sprintPlanning: {
    trigger: "Sprint status change to 'Active'",
    action: "Update feature assignments and status",
    mapping: {
      sprintGoal: "Feature requirements update",
      teamCapacity: "Story points allocation",
      velocity: "Sprint completion prediction"
    }
  },

  // Feature Completion → Release Planning
  featureToRelease: {
    trigger: "Feature status change to 'Done'",
    action: "Update release planning database",
    mapping: {
      featureList: "Release scope",
      completionDate: "Release timeline update",
      testingResults: "Release readiness"
    }
  }
};

/**
 * Dashboard View Configurations
 */
const DASHBOARD_VIEWS = {
  productManager: {
    name: "🎯 Product Manager Dashboard",
    filters: ["High priority features", "Active sprints", "Recent research"],
    groupBy: "Status",
    sortBy: "Priority"
  },
  
  sprintBoard: {
    name: "🏃 Sprint Kanban",
    filters: ["Current sprint features"],
    groupBy: "Status", 
    sortBy: "Story Points"
  },

  researchPipeline: {
    name: "🔬 Research Pipeline",
    filters: ["Active research", "Pending analysis", "High impact insights"],
    groupBy: "Study Type",
    sortBy: "Impact Score"
  },

  releaseTracker: {
    name: "🚀 Release Tracker",
    filters: ["Upcoming releases", "In development", "Ready to deploy"],
    groupBy: "Release Type",
    sortBy: "Target Date"
  }
};

export {
  NOTION_DATABASE_SCHEMAS,
  AUTOMATION_WORKFLOWS,
  DASHBOARD_VIEWS
};
