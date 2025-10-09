# AGENTS.md - SaaS Project Management Platform

*This is a mock project example demonstrating how to structure an AGENTS.md file for a Bubble.io-only implementation as a Tech Lead consultant would approach it.*

## Project Overview

**Project Name**: TaskMaster Pro  
**Project Type**: B2B SaaS Project Management Platform  
**Target Users**: Small to medium-sized teams (5-50 people)  
**Primary Goal**: Create a comprehensive project management solution with time tracking, team collaboration, and client portal features  

### Architecture Philosophy
This project follows a **MVP-first approach** with planned scalability. We're building a foundation that can evolve from a simple task manager to a comprehensive business management platform.

### Tech Stack (Bubble.io Only)
- **Frontend**: Bubble.io visual editor with responsive design system
- **Backend**: Bubble.io workflows and database
- **Database**: Bubble.io native database (with migration strategy to external DB)
- **Authentication**: Bubble.io user management with custom roles
- **APIs**: Bubble.io API Connector for third-party integrations
- **Hosting**: Bubble.io hosting (with custom domain)

## Implementation Strategy & Technical Approach

### Phase 1: Foundation (Weeks 1-3)
**Focus**: Core user management and basic project structure

#### Database Architecture
```
Core Data Types:
├── User (enhanced built-in type)
│   ├── role (Option Set: admin, manager, member, client)
│   ├── company (Company)
│   ├── avatar_url (text)
│   └── timezone (text)
├── Company
│   ├── name (text)
│   ├── subscription_plan (Option Set)
│   ├── max_users (number)
│   └── created_date (date)
├── Project
│   ├── name (text)
│   ├── description (text)
│   ├── company (Company)
│   ├── status (Option Set: active, paused, completed)
│   ├── start_date (date)
│   ├── end_date (date)
│   └── project_manager (User)
└── Task
    ├── title (text)
    ├── description (text)
    ├── project (Project)
    ├── assignee (User)
    ├── status (Option Set: todo, in_progress, review, done)
    ├── priority (Option Set: low, medium, high, urgent)
    ├── due_date (date)
    └── estimated_hours (number)
```

#### Technical Implementation Notes
- **Use Option Sets** for all status fields and roles to ensure data consistency
- **Implement soft deletes** by adding "is_deleted" boolean fields instead of hard deletes
- **Create custom indexes** on frequently queried fields (project status, task assignee)
- **Design for multi-tenancy** from day one using Company as the root entity

### Phase 2: Core Features (Weeks 4-6)
**Focus**: Task management, time tracking, and basic reporting

#### Advanced Data Types
```
TimeEntry
├── task (Task)
├── user (User)
├── start_time (date)
├── end_time (date)
├── duration_minutes (number)
├── description (text)
└── billable (boolean)

Comment
├── content (text)
├── author (User)
├── task (Task)
├── created_date (date)
└── is_internal (boolean)

Attachment
├── file_url (text)
├── filename (text)
├── task (Task)
├── uploaded_by (User)
└── file_size (number)
```

#### Performance Optimization Strategy
- **Use backend workflows** for time-intensive operations (reports, bulk updates)
- **Implement pagination** on all repeating groups (max 20 items per page)
- **Cache calculated values** (total hours, project progress) in dedicated fields
- **Use conditional formatting** sparingly to avoid excessive database calls

### Phase 3: Advanced Features (Weeks 7-9)
**Focus**: Client portal, advanced reporting, and integrations

#### Client Portal Architecture
```
ClientPortal
├── company (Company)
├── allowed_projects (list of Projects)
├── custom_branding (boolean)
└── portal_url (text)

ProjectReport
├── project (Project)
├── report_type (Option Set: weekly, monthly, custom)
├── generated_date (date)
├── total_hours (number)
├── completed_tasks (number)
└── report_data (text - JSON string)
```

## Bubble.io Best Practices & Patterns

### Database Design Patterns

#### 1. The "Hub and Spoke" Pattern
```
Company (Hub)
├── Users (Spoke)
├── Projects (Spoke)
├── TimeEntries (indirect via Users/Projects)
└── Reports (Spoke)
```
**Rationale**: Enables clean multi-tenancy and efficient privacy rules

#### 2. The "Status Machine" Pattern
```
Task Status Flow:
todo → in_progress → review → done
     ↓         ↓        ↓
   (archived) (archived) (archived)
```
**Implementation**: Use Option Sets with predefined transitions in workflows

#### 3. The "Calculated Field" Pattern
```
Project Data Type:
├── total_tasks (number) - calculated
├── completed_tasks (number) - calculated
├── progress_percentage (number) - calculated
└── total_hours (number) - calculated
```
**Rationale**: Pre-calculate expensive operations to improve UI performance

### Workflow Architecture

#### Frontend Workflows (User Interactions)
```
User Actions:
├── Create Task → Validate → Save → Update Project Stats → Send Notifications
├── Start Timer → Check Permissions → Create TimeEntry → Update UI
├── Complete Task → Update Status → Recalculate Project → Notify Team
└── Upload File → Validate Size → Save to Bubble Storage → Link to Task
```

#### Backend Workflows (Scheduled/Heavy Operations)
```
Scheduled Operations:
├── Daily Report Generation (runs at 6 AM)
├── Weekly Email Summaries (runs Sunday 8 PM)
├── Data Cleanup (runs monthly)
└── Billing Calculations (runs on subscription dates)
```

### Security & Privacy Implementation

#### Privacy Rules Strategy
```
Company Level:
- Users can only see data from their Company
- Admins can see all Company data
- Clients can only see assigned Projects

Project Level:
- Team members can see assigned Projects
- Project Managers can see all team Projects
- Clients can only see their specific Projects

Task Level:
- Assignees can edit their Tasks
- Project Managers can edit all Project Tasks
- Comments marked as internal are hidden from Clients
```

#### Authentication Flow
```
Registration → Email Verification → Company Assignment → Role Assignment → Onboarding
Login → Check Subscription Status → Load Dashboard → Set User Preferences
```

## Development Workflow & Organization

### Version Control Strategy
- **One branch per major feature** (not per developer)
- **Daily standups** to coordinate development
- **Feature flags** using custom states for gradual rollouts
- **Staging environment** for testing before production deployment

### Testing Approach
```
Manual Testing Checklist:
├── User Permissions (test each role)
├── Data Validation (test edge cases)
├── Responsive Design (test on mobile/tablet)
├── Performance (test with large datasets)
└── Integration Points (test API connections)

Automated Testing:
├── API Endpoint Testing (using external tools)
├── Database Integrity Checks (scheduled workflows)
└── Performance Monitoring (Bubble metrics + external)
```

### Code Organization
```
Element Naming Convention:
├── Pages: "Page_Dashboard", "Page_Projects"
├── Popups: "Popup_CreateTask", "Popup_ConfirmDelete"
├── Reusable Elements: "RE_TaskCard", "RE_Timer"
├── Groups: "Group_ProjectHeader", "Group_TaskList"
└── Custom States: "state_selected_project", "state_is_loading"
```

## Scalability Considerations

### Performance Optimization
- **Database indexes** on Company, Project, and User fields
- **Conditional data loading** - only load what's needed for current view
- **Image optimization** - compress avatars and attachments
- **CDN strategy** - use Bubble's built-in CDN for static assets

### Migration Strategy (Future External DB)
```
Migration Readiness:
├── Use consistent naming conventions (snake_case)
├── Avoid complex nested data structures
├── Document all data relationships
├── Use UUIDs for primary keys where possible
└── Keep calculated fields separate from core data
```

### Third-party Integration Points
```
Planned Integrations:
├── Email (Sendgrid/Postmark) - transactional emails
├── Storage (AWS S3) - file attachments
├── Analytics (Mixpanel) - user behavior tracking
├── Payments (Stripe) - subscription management
└── Calendar (Google/Outlook) - deadline sync
```

## Feature Implementation Roadmap

### MVP Features (Must Have)
- [ ] User registration and authentication
- [ ] Company/team management
- [ ] Project creation and management
- [ ] Task creation, assignment, and tracking
- [ ] Basic time tracking
- [ ] Simple reporting dashboard
- [ ] Email notifications

### Phase 2 Features (Should Have)
- [ ] Advanced time tracking with categories
- [ ] Client portal with limited access
- [ ] File attachments and comments
- [ ] Gantt chart visualization
- [ ] Advanced reporting and exports
- [ ] Team calendar integration
- [ ] Mobile responsive optimization

### Phase 3 Features (Nice to Have)
- [ ] API for third-party integrations
- [ ] Advanced analytics and insights
- [ ] Custom fields and workflows
- [ ] Bulk operations and imports
- [ ] Advanced client branding
- [ ] Resource planning and forecasting
- [ ] Integration marketplace

## Technical Constraints & Limitations

### Bubble.io Specific Limitations
- **Real-time updates** - Limited to polling, not true WebSocket connections
- **Complex calculations** - Should be done in backend workflows
- **File storage** - Limited to Bubble's storage (consider S3 for large files)
- **Custom styling** - Some advanced CSS requires plugins or custom code
- **Offline functionality** - Not natively supported

### Workarounds & Solutions
```
Real-time Updates:
- Use "Do every 5 seconds" workflow for critical updates
- Implement manual refresh buttons for non-critical data
- Use Bubble's real-time features where available

Complex Calculations:
- Move heavy calculations to scheduled backend workflows
- Cache results in database fields
- Use API calls to external services for complex math

File Management:
- Compress images before upload
- Implement file type and size validation
- Use CDN for frequently accessed files
```

## Quality Assurance & Testing

### Pre-launch Checklist
- [ ] **Performance Testing**: App loads within 3 seconds
- [ ] **Mobile Testing**: All features work on mobile devices
- [ ] **Permission Testing**: Each user role has appropriate access
- [ ] **Data Validation**: All forms validate input correctly
- [ ] **Email Testing**: All notification emails are sent and formatted correctly
- [ ] **Payment Testing**: Subscription flows work correctly
- [ ] **Backup Testing**: Data backup and recovery procedures work

### Post-launch Monitoring
```
Key Metrics to Track:
├── Page Load Times (< 3 seconds)
├── User Registration Conversion (> 10%)
├── Feature Adoption Rates (> 50% for core features)
├── Error Rates (< 1% of sessions)
├── User Retention (> 40% after 30 days)
└── Performance Scores (> 80/100)
```

## Support & Maintenance Strategy

### Bug Tracking & Resolution
- **Priority System**: Critical (< 2 hours), High (< 24 hours), Medium (< 1 week), Low (< 1 month)
- **User Feedback Collection**: In-app feedback forms and email support
- **Error Logging**: Custom error tracking using Bubble workflows
- **Regular Updates**: Monthly feature releases, weekly bug fixes

### Documentation Strategy
- **User Documentation**: In-app help system and knowledge base
- **Technical Documentation**: Detailed workflow documentation
- **API Documentation**: If external integrations are added
- **Change Log**: Track all feature updates and bug fixes

---

## Tech Lead Recommendations

### Immediate Action Items
1. **Set up proper development workflow** - staging environment, version control
2. **Implement comprehensive privacy rules** from day one
3. **Create reusable elements** for common UI components
4. **Establish naming conventions** and stick to them religiously
5. **Set up basic analytics** to track user behavior from launch

### Risk Mitigation
- **Data backup strategy** - weekly exports of critical data
- **Performance monitoring** - set up alerts for slow-loading pages
- **Security audits** - monthly review of privacy rules and user permissions
- **Scalability planning** - monitor usage patterns and plan for growth

### Success Metrics
- **Technical**: < 3 second page loads, < 1% error rate, 99% uptime
- **User Experience**: > 4.5/5 user satisfaction, < 10% churn rate
- **Business**: > 20% month-over-month growth, > $10K MRR within 6 months

This AGENTS.md serves as both a technical specification and a living document that should be updated as the project evolves. Regular reviews with the development team ensure alignment and help identify potential issues before they become problems.