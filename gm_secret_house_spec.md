# 🏰 The GM Secret House — Project Specification

## 1. Overview

The GM Secret House is a full-scale web platform dedicated to Dungeons & Dragons (D&D) players.

### Core Goals:

- Centralized D&D knowledge base (rules, books, classes, etc.)
- User-generated content platform (homebrew + official)
- Advanced creation tools (characters, maps, items)
- Social publishing system
- Future-ready for:
  - Marketplace (digital + physical goods)
  - Subscription system
  - Browser-based MMORPG (2D turn-based)

---

## 2. Tech Stack

### Frontend

- Framework: **Next.js (App Router)**
- Styling: **TailwindCSS + shadcn/ui**
- Animations: **Framer Motion**
- State: **Zustand or React Context**
- Forms: **React Hook Form + Zod**

### Backend

- API: **Next.js API routes (initially)**
- Auth: **NextAuth.js**
- Database: **MongoDB (Mongoose)**

### Deployment

- Platform: **Vercel**
- Repo: **GitHub**

---

## 3. Core Features

## 3.1 Landing Page

### Hero Section

- Background: VIDEO (autoplay, loop, muted)
- Overlay: dark gradient
- CTA Buttons

### Feature Blocks

- 4 feature cards

### Content Categories

- Equipment
- Spells
- Artifacts
- Bestiary

### Heroes Carousel

- Slider with user heroes

### CTA Section

### Footer

---

## 4. Routing Structure

/
/library
/tools
/tools/characters
/tools/maps
/tools/items
/community
/profile/[username]
/admin
/game

---

## 5. Authentication System

### User Model

User:

- email
- passwordHash
- username
- avatarUrl
- createdAt

---

## 6. Profile

- Avatar
- Username
- Creations

---

## 7. Content System

Content:

- type
- title
- description
- data (JSON)
- authorId
- isPublic

---

## 8. Tools

### Character Builder

### Map Builder

### Item Builder

---

## 9. Community

- Public feed
- Filters

---

## 10. Admin Panel

- Manage users
- Moderate content

---

## 11. Database

Collections:

- users
- content
- assets
- subscriptions
- orders

---

## 12. Future Systems

### Subscriptions

### Marketplace

### MMORPG (/game)

---

## 13. Media

Local → CDN later

---

## 14. UI/UX

Dark fantasy style

---

## 15. Performance

- Lazy load
- Optimize video

---

## 16. Phases

Phase 1: MVP
Phase 2: Tools
Phase 3: Admin
Phase 4: Monetization
Phase 5: Game

---

## 17. Notes

- Modular architecture
- Scalable
- Flexible schemas
