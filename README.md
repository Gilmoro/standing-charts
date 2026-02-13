# Choir Standing Charts

A web-based visualization tool for creating and managing choir formations with curved or straight risers.

## Features

- 🎵 **Curved Riser Layouts**: Visualize choir formations with realistic curved risers
- 📏 **Center Straight Sections**: Optional straight center sections with curved outer parts
- 👥 **Student Name Management**: Display student names instead of numbers
- ⚙️ **Customizable Settings**: 
  - Adjust number of risers (1-10)
  - Set students per riser (1-30)
  - Control curvature (0-100%)
  - Configure straight section size
- 🖱️ **Interactive Editing**: Click on any position to edit student names
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Usage

1. Open `index.html` in a web browser
2. Adjust the configuration settings:
   - **Number of Risers**: Set how many risers your choir has
   - **Students per Riser**: Set how many students are on each riser
   - **Curvature**: Adjust the curve of the risers (0 = straight, 100 = maximum curve)
   - **Center Straight Section**: Enable to have a straight center with curved sides
   - **Straight Section Size**: When center straight section is enabled, control what percentage of the center is straight
3. Click "Generate Sample Names" to populate with random names
4. Click on any student position (either on the canvas or in the list) to edit their name
5. Click "Clear Names" to remove all names

## Screenshots

### Default Curved Risers
![Curved Risers](https://github.com/user-attachments/assets/c477e25a-8a36-41e9-9b7f-e254985b4724)

### With Student Names
![With Names](https://github.com/user-attachments/assets/2c843d9c-93ca-4b73-a4ee-9743c51e3d0b)

### Center Straight Section
![Center Straight](https://github.com/user-attachments/assets/f47e54db-b801-4565-b1f0-efb816df0b39)

## Files

- `index.html`: Main HTML structure
- `styles.css`: CSS styling and layout
- `script.js`: JavaScript logic for visualization and interactivity

## Browser Compatibility

Works in all modern browsers that support HTML5 Canvas and ES6 JavaScript:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Open source - feel free to use and modify for your choir's needs!