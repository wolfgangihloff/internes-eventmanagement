# Event Coordination System (ECS) – Product Requirements Document

## 1. Overview

**Problem**  
The planning of external trade fairs and industry events is fragmented across email, spreadsheets, calendars, and implicit organizer knowledge. Event discovery, participant coordination, booking timing, reminders, and follow-up activities are handled manually and inconsistently. Changes often trigger manual coordination loops, leading to missed deadlines, unclear responsibilities, and lack of visibility.

**Solution**  
A centralized, event-driven system for managing external trade fairs and industry events as stateful entities. The system provides a single source of truth, supports role-based access, helps employees apply to attend relevant events, creates and tracks dynamic checklists and follow-up tasks, and supports reminders for booking windows, hotels, calendars, and other operational needs.

**Deployment Context**  
Because the local server is currently not available, the system should initially be deployed on Hetzner.

**Design Direction**  
The UI should visually align with the company brand and style direction reflected on Cognitivo's website, with a professional, modern, restrained B2B appearance.

**Goal**  
Reduce coordination overhead by more than 50%, eliminate manual sync errors, make responsibilities and deadlines visible, and provide a reliable operational workflow for external trade fair participation.

---

## 2. Users & Roles

- **Marketing / Research Team** – identifies relevant trade fairs and industry events and enters them into the system
- **Employees** – view relevant events, apply to participate, complete assigned tasks, and submit follow-up reports
- **Managers** – review and approve participation, oversee team attendance, and ensure budget and priorities are aligned
- **Event Admin** – manages event data, permissions, checklist templates, reminders, and coordination settings
- **Agent (AI)** – assists with planning, detects missing information, suggests next steps, and helps generate reminders, reports, and communication drafts

### Role and Access Model
The system must support differentiated permissions for managers, regular employees, and event administrators. Access should be configurable so that each role can only see and perform the actions relevant to them.

Examples:
- Employees can browse approved or visible events, apply to attend, and complete tasks assigned to them
- Managers can approve or reject participation requests for their team and review event readiness
- Event Admins can create, edit, publish, archive, and configure events, reminders, dynamic checklists, and calendar-related settings

---

## 3. Core Concepts (Domain Model)

- **Event** – central object representing an external trade fair or industry event relevant to the business
- **Participation** – employee application, approval, and attendance status
- **Task** – dynamic operational work item, optionally created from templates, reminders, or manual assignment
- **Checklist** – reusable and extendable set of event preparation and execution items
- **Reminder** – time-based or condition-based prompt for bookings, hotel reservations, calendar entry, reporting, or other deadlines
- **Communication** – outbound messages and internal notifications
- **Calendar Entry** – references to internal and customer-side calendar appointments that may need to be tracked or reminded

---

## 4. Event Lifecycle (State Machine)

```
draft → proposed → approved → planned → executed
```

State transitions trigger automation.

---

## 5. Key User Scenarios & Acceptance Criteria

---

### Scenario 1: Marketing identifies and enters a trade fair

**Flow**
1. Marketing or research identifies a relevant external trade fair
2. Creates a new event record
3. Adds title, short description, organizer link, industry context, date information, and known participant information if already available
4. Sets the event status for internal review or publication

**Acceptance Criteria**
- Event can be created with minimal required fields such as title and external link
- Event type is clearly scoped to external trade fairs and industry events, not internal trainings
- Additional fields such as industry, organizer, booking availability status, and notes can be added later
- System logs creator, timestamps, and update history

---

### Scenario 2: Employees browse and apply to attend

**Flow**
1. Employee views the event feed
2. Sees relevant trade fairs
3. Opens event details
4. Applies to participate

**Acceptance Criteria**
- Employees can browse visible events without needing to coordinate by email first
- Users can apply in one click or with a short rationale
- Duplicate applications are prevented
- Participation list updates without manual reconciliation
- Managers and admins can see applicants based on permissions

---

### Scenario 3: Employees propose new events

**Flow**
1. Employee creates a proposed event
2. Adds basic information and source link
3. Manager or Event Admin reviews the proposal

**Acceptance Criteria**
- Any authorized employee can propose a new external event
- Proposed events are clearly marked as not yet approved
- Review workflow is enforced before broader publication or booking actions

---

### Scenario 4: Manager approves participation

**Flow**
1. Manager reviews applicants for an event
2. Approves or rejects participation
3. Confirmed attendees become visible to relevant stakeholders

**Acceptance Criteria**
- Only authorized managers or admins can approve participation
- Participation status supports at least `applied`, `approved`, `rejected`, and `confirmed`
- Manager permissions can be scoped to their own employees or teams
- Employees receive clear feedback on application outcome

---

### Scenario 5: Dynamic checklist and task planning

**Flow**
1. Event reaches a stage where preparation begins
2. System suggests or creates checklist items and tasks
3. Event Admin, manager, or participant extends the checklist as needed

**Examples**
- Register once ticket sales open
- Book hotel
- Add internal calendar entry
- Add customer calendar entry
- Prepare booth materials
- Write follow-up report after the event

**Acceptance Criteria**
- Tasks are not mandatory for every event, but the system supports adding them when needed
- Checklists can be created dynamically per event
- Reusable checklist templates can be extended or edited per event
- Tasks can be assigned to one or more participants
- Participants can clearly see which tasks are assigned to them
- Tasks support due dates, completion status, and reminders

---

### Scenario 6: Reminder for booking window and travel logistics

**Flow**
1. Event is known early, but ticket sales start later
2. Event Admin or manager stores expected booking timing
3. System sends reminders when booking windows or planning deadlines approach

**Acceptance Criteria**
- The system supports reminders for ticket booking start dates
- The system supports reminders for hotel booking and other travel-related steps
- Reminders can be attached to an event, a checklist item, or a task
- Reminders can notify the relevant responsible people before deadlines
- Reminder timing is configurable

---

### Scenario 7: Participants are aware of required work

**Flow**
1. Employee is approved for an event
2. Employee sees assigned tasks and checklist obligations in the event detail view
3. Employee receives reminders until due items are completed

**Acceptance Criteria**
- Participants can always see whether there are open tasks related to their event attendance
- The UI highlights incomplete assigned tasks prominently
- Reminder behavior can be configured for open tasks
- Task completion status is visible to managers and admins

---

### Scenario 8: Calendar coordination across internal and customer calendars

**Flow**
1. Event requires internal planning visibility and potentially customer-facing calendar coordination
2. Calendar references are stored in the event
3. System reminds responsible users to create or update both entries if needed

**Acceptance Criteria**
- The system can store references to an internal calendar and a customer-side calendar workflow
- The system supports reminder logic for both calendar contexts
- Calendar-related checklist items can be part of reusable templates or event-specific setup
- Deep bidirectional sync is not required for MVP, but reminder and tracking support must exist

---

### Scenario 9: Event changes trigger coordinated follow-up

**Flow**
1. Event date, location, or status changes
2. System identifies affected tasks, reminders, and participants
3. Users are prompted to update bookings, communication, and calendars

**Acceptance Criteria**
- Changes to important event properties are logged
- Related reminders and checklist deadlines can be recalculated
- The system suggests communication updates when a change affects participants
- Affected owners can see what needs rework after the change

---

### Scenario 10: Follow-up reporting after attendance

**Flow**
1. Event is completed
2. One or more participants are asked to submit a report
3. Report task remains visible until completed

**Acceptance Criteria**
- Report writing can be configured as a standard or optional post-event task
- Report tasks can be assigned during planning or after the event
- Managers and admins can track whether follow-up reporting has been completed

---

### Scenario 11: Agent-assisted coordination

**Flow**
1. User opens an event
2. Agent analyzes completeness and timeline
3. Agent suggests missing items, next steps, or reminder setup

**Examples**
- “Ticket sales usually start later; create a reminder for booking.”
- “There is no hotel reminder yet for confirmed participants.”
- “A follow-up report is missing.”

**Acceptance Criteria**
- Agent can identify missing tasks, reminders, or event fields
- Suggestions are actionable and can be accepted or ignored
- Agent actions and suggestions are logged
- Agent helps reduce manual coordination, but does not replace user approval for sensitive actions

---

## 6. UX Requirements

### Visual Design
- Visual style should align with Cognitivo's brand language: professional, modern, restrained, clean, and suitable for a B2B software product
- Colors, spacing, and typography should follow a coherent design system inspired by the existing company website

### Event Feed
- List of all relevant external trade fairs and industry events
- Filter by relevance, status, industry, application status, and ownership
- Visibility rules depend on role and permissions
- Important deadline indicators should be visible from the list view

### Event Detail View (Primary Screen)
- Event information
- Participant applications and approvals
- Dynamic checklist
- Task list with ownership and deadlines
- Reminder overview
- Communication history
- Calendar-related tracking fields

### Interaction Principles
- One-click core actions where possible, such as apply, approve, assign, complete, or remind
- No hidden state
- All coordination visible in one place
- Participants should immediately understand what is expected from them

---

## 7. Non-Functional Requirements

- Initial deployment target is Hetzner
- Audit log for all relevant changes
- Role-based access control for employees, managers, and event admins
- Extensible checklist and task model
- Reminder engine for booking, hotel, calendar, and reporting deadlines
- Near real-time or reliably refreshed state updates
- Configuration model that allows future integrations without restructuring the core domain

---

## 8. MVP Scope

Must-have:
- Event CRUD for external trade fairs and industry events
- Role and permission model for employees, managers, and event admins
- Participation workflow with apply and approve steps
- Dynamic checklist and task assignment
- Reminder support for booking windows, hotels, reports, and calendar actions
- Event detail screen with participant, checklist, reminder, and communication context
- Initial deployment on Hetzner
- UI design aligned with Cognitivo brand direction
- Basic agent suggestions for missing steps and deadlines

Out of scope (Phase 2):
- Full two-way calendar synchronization
- Full travel booking integration
- Advanced autonomous agent execution without explicit approval
- External CRM or ticketing integrations

---

## 9. Success Metrics

- % reduction in coordination time
- # of manual emails replaced
- Task completion rate
- Event execution success rate

---

## 10. Future Extensions

- Calendar integration (Google/Outlook)
- Slack / Teams integration
- Full agent autonomy (“run event planning”)
- Cross-event analytics

---

## 11. Key Principle

> The system manages **state and coordination**, not just data entry.

---

End of Document

