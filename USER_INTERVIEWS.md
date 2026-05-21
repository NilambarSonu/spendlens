# SpendLens — User Research & Product Design Iterations

To ensure SpendLens solves real problems and converts visitors into leads, we conducted 3 qualitative user research interviews with early-stage startup leaders. This document summarizes their pain points and our design iterations.

---

## 1. Interview Summaries

### Interviewee A: Sarah T. (CTO of Stealth-Stage FinTech, 5 Developers)
- **Current Stack**: Cursor Business (5 seats), ChatGPT Team (5 seats), GitHub Copilot Pro (5 seats).
- **Core Pain Point**: *"We have huge subscription overlap. Half the developers prefer Cursor's built-in chat, two use raw Copilot, but we keep paying for ChatGPT Team because we are afraid of missing out on features. We're paying close to $500/mo just for dev assistants."*
- **Reaction to SpendLens concept**: *"If a tool showed me exactly how to consolidate this and how much I'd save, I'd implement it immediately."*

### Interviewee B: Jonas M. (Solo Founder of SaaS Tool, 1 Team Member)
- **Current Stack**: Claude Team Plan, OpenAI API.
- **Core Pain Point**: *"I signed up for Claude Team because I wanted collaborative workspaces, but didn't realize they have a 5-seat minimum billing block. I am basically paying $150/mo for two people. I feel ripped off but don't have time to review billing dashboards."*
- **Reaction to SpendLens concept**: *"A simple form that flags minimum seat overpays would have saved me $90/mo six months ago."*

### Interviewee C: Priyesh K. (CEO of Content Agency, 12 Writers & Researchers)
- **Current Stack**: ChatGPT Plus (12 seats), Claude Pro (12 seats).
- **Core Pain Point**: *"We write heavily. Some writers say Claude is better for long essays, others prefer ChatGPT for brainstorming. So we pay for both. It costs us $480/month. We want a unified portal, but raw API setup seems too technical."*
- **Reaction to SpendLens concept**: *"I want a recommendation on which one is objectively better so I can make a decision."*

---

## 2. Product Design Iterations Triggered by User Feedback

Based on these interviews, we modified our product specifications in three critical ways:

### A. Implemented Redundancy Diagnostics
- **Feedback**: Sarah T. and Priyesh K. both suffered from overlapping tools.
- **Action**: Programmed the deterministic `detectRedundancy` function. If a user enters both ChatGPT Plus and Claude Pro, the engine flags this as a high-confidence redundancy, recommending that they consolidate into a single workspace and drop the duplicate, saving up to $360/year per user.

### B. Created the "Value-First" Lead Capture
- **Feedback**: Users voiced skepticism towards standard lead-capture landing pages: *"I hate calculators that make me type in my email just to view the result. I always close the tab immediately."*
- **Action**: Formulated our two-step workflow. Users see their complete audit score, per-tool savings breakdown, and action checkmarks instantly on submission. The email capture is entirely optional, framed as *"Save your audit or receive email alerts when tools adjust their prices."* This builds trust and yields higher engagement.

### C. Added Local Storage Sync
- **Feedback**: Jonas M. mentioned completing forms, getting distracted, and returning only to find their inputs wiped: *"If I have to search my invoices to input the prices twice, I won't do it."*
- **Action**: Integrated automated `localStorage` state syncing on every input change, assuring inputs survive refreshes, accidental page closes, or network disruptions.
