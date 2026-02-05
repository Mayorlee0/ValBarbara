# 💘 Valentine's Website for Barbara

A polished, funny, and romantic Valentine's Day website with premium interactions and smooth animations. Built with vanilla HTML, CSS, and JavaScript—no frameworks, no build tools.

## ✨ Features

### Core Experience
- **The Impossible "No" Button**: Dodges cursor on desktop, jumps away on mobile
- **Smooth Animations**: Apple-like transitions and micro-interactions
- **Error Modal**: Playful "system error" when someone tries clicking No
- **Romantic Success Flow**: Confetti, date selector, and confirmation screens
- **Sound Effects**: Subtle UI sounds with Web Audio API (no external files)
- **Fully Responsive**: Works beautifully on mobile and desktop
- **Accessible**: Keyboard navigation, reduced motion support, proper focus states

### Technical Highlights
- Premium design with clean spacing and typography
- Lightweight (~15KB total uncompressed)
- No external dependencies
- Works offline
- Respects user preferences (reduced motion, sound muting)

## 🚀 Quick Start

### Local Development
Simply open `index.html` in your browser. That's it!

```bash
# Option 1: Double-click index.html

# Option 2: Use a local server (optional)
python -m http.server 8000
# or
npx serve
```

### Deploy to Vercel

1. **Install Vercel CLI** (first time only):
```bash
npm i -g vercel
```

2. **Deploy**:
```bash
cd valentine
vercel
```

3. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? (Select your account)
   - Link to existing project? **N**
   - Project name? `valentine-barbara` (or your choice)
   - In which directory? `./`
   - Want to override settings? **N**

4. Vercel will give you a live URL! 🎉

### Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository (or drag/drop the folder)
4. Click "Deploy"

## 📁 File Structure

```
valentine/
├── index.html       # Main HTML structure
├── styles.css       # Premium styles and animations
├── script.js        # All interactive features
├── vercel.json      # Vercel deployment config
└── README.md        # This file
```

## 🎨 Customization

### Change Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --accent-pink: #ff4d6d;
    --bg-gradient-start: #fff0f6;
    --bg-gradient-end: #ffe8f0;
}
```

### Modify Dodge Messages
Edit the array in `script.js`:
```javascript
const dodgeMessages = [
    "Not today 😌",
    "Nice try, my love.",
    // Add your own messages here
];
```

### Date Options
Update the date selector cards in `index.html`:
```html
<button class="date-option" data-choice="Your custom option 🎉">
    <span class="date-emoji">🎉</span>
    <span class="date-label">Your option</span>
</button>
```

## 🎯 How It Works

### Button Dodge Logic
- **Desktop**: Detects cursor proximity (80px threshold) and smoothly moves button
- **Mobile**: Intercepts touch events and repositions on tap attempt
- **Cooldown**: 500ms between dodges to prevent jitter
- **Safe Zone**: Keeps button 60px from screen edges

### Sound System
- Uses Web Audio API to generate tones (no audio files needed)
- Respects autoplay restrictions (waits for user interaction)
- Mute state persists via localStorage
- Two sounds: "boop" for button moves, "sparkle" for success

### Confetti
- Lightweight canvas-based particle system
- 150 particles with random colors, sizes, and rotation
- Auto-cleans when particles exit screen
- Respects `prefers-reduced-motion`

## ♿ Accessibility

- Semantic HTML5 structure
- Keyboard navigable (Tab, Enter, Escape)
- Focus indicators on all interactive elements
- ARIA labels where needed
- Reduced motion support
- Color contrast meets WCAG AA standards

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Mobile 90+

## 💡 Tips

- **Sound**: The site starts with sound ON. Users can mute via the top-right button.
- **Mobile**: Touch targets are 44x44px minimum for comfortable tapping.
- **Screenshots**: The final screen encourages Barbara to send a screenshot (no sharing API needed).

## 🎁 Perfect For

- Valentine's Day proposals
- Anniversary surprises
- "Will you be my girlfriend/boyfriend?" asks
- Creative date invitations
- Romantic gestures

## 📝 License

This is a personal romantic project. Feel free to fork and customize for your own sweetheart! ❤️

---

**Made with 💘 for Barbara**

*Good luck! May the "Yes" button be ever in your favor.*
