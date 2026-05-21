# SpendLens — Metrics Dashboard & Analytics Specifications

This document defines the key performance indicators (KPIs), event-tracking definitions, and product pivot thresholds used to monitor SpendLens’ efficiency as a lead-generation machine for Credex.

---

## 1. North Star Metric: Cumulative Customer Savings (CCS)

Our absolute North Star is **Cumulative Customer Savings (CCS)**, defined as:

$$\text{CCS} = \sum (\text{total\_monthly\_savings} \times 12) \quad \text{across all audited sessions.}$$

This represents the total annual capital SpendLens surfaces for founders. Tracking CCS validates the direct business value we deliver to the startup community.

---

## 2. Product Conversion Funnel KPIs

We track 4 conversion benchmarks down the acquisition funnel:

| Funnel Stage | Target Metric | Metric Description |
| :--- | :--- | :--- |
| **1. Visitor-to-Audit** | **> 30.0%** | Percentage of unique landing page sessions that submit the audit form. |
| **2. Audit-to-Lead** | **> 18.0%** | Percentage of completed audits where the user submits the lead-capture form. |
| **3. Lead-to-Consultation**| **> 5.0%** | Percentage of captured leads spending >$500/mo who book a free Credex session. |
| **4. Viral Share Coefficient**| **> 10.0%**| Percentage of users who click "Copy Share Link" or trigger an OG share action. |

---

## 3. Custom Event Tracking Schema

To analyze user friction, we track these custom telemetry events:

### A. `audit_form_submitted`
- **Trigger**: User clicks "Run My Audit".
- **Payload**:
  ```json
  {
    "team_size": 8,
    "primary_use_case": "coding",
    "total_tools_input": 3,
    "total_monthly_spend": 560
  }
  ```

### B. `lead_captured`
- **Trigger**: User clicks "Save My Audit" in the lead collection block.
- **Payload**:
  ```json
  {
    "has_company_name": true,
    "has_role": true,
    "total_monthly_savings": 240,
    "is_high_savings": false
  }
  ```

### C. `share_link_copied`
- **Trigger**: User clicks the share button to copy the audit URL.
- **Payload**:
  ```json
  {
    "audit_id": "uuid-token",
    "savings_amount": 240
  }
  ```

### D. `credex_cta_clicked`
- **Trigger**: User clicks "Book free 15-min consultation" on the high-savings banner.
- **Payload**:
  ```json
  {
    "audit_id": "uuid-token",
    "savings_amount": 750
  }
  ```

---

## 4. Product Pivot & Optimization Thresholds

If weekly performance drops below our validation lines, we trigger specific optimizations:

- **If Visitor-to-Audit falls < 20%**: The form has too much friction. *Optimization*: Reduce required tool inputs, simplify the plan selectors, or move use case fields to single-click radio buttons.
- **If Audit-to-Lead falls < 10%**: The lead capture value proposition is weak. *Optimization*: Offer a downloadable PDF report as a hook, or refine the copywriting on the lead-capture card.
- **If High-Savings CTA click rate falls < 3%**: The Credex consultation banner is blending in. *Optimization*: Implement dynamic animation highlights, increase visual contrast, or customize the CTA text with the user's actual savings (e.g., *"Book a call to claim your $2,880 savings"*).
