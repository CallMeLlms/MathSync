  {
      "id": "lab-picker-1",
      "type": "PICKER",
      "question": "Which shape has 4 equal sides?",
      "answer": "Square",
      "metadata": {
        "options": ["Square", "Triangle", "Circle", "Rectangle"]
      }
    },
    {
      "id": "lab-picker-2",
      "type": "PICKER",
      "question": "What is 3 + 4?",
      "answer": "7",
      "metadata": {
        "options": ["5", "6", "7"]
      }
    },

    {
      "id": "lab-numpad-1",
      "type": "NUMPAD",
      "question": "What is 5 + 3?",
      "equation": { "left": "5 + 3", "operator": "=", "blank": "right" },
      "answer": 8,
      "maxDigits": 2
    },
    {
      "id": "lab-numpad-2",
      "type": "NUMPAD",
      "question": "What is 12 - 4?",
      "equation": { "left": "12 - 4", "operator": "=", "blank": "right" },
      "answer": 8,
      "maxDigits": 2
    },

    {
      "id": "lab-matcher-1",
      "type": "MATCHER",
      "question": "Match each number to its word.",
      "pairs": [
        { "left": "1", "right": "One" },
        { "left": "2", "right": "Two" },
        { "left": "3", "right": "Three" },
        { "left": "4", "right": "Four" }
      ]
    },

    {
      "id": "lab-composer-1",
      "type": "COMPOSER",
      "question": "Make the number 7 using two parts.",
      "target": 7,
      "metadata": {
        "max": 10,
        "hint": "Which two numbers add up to 7?"
      }
    },

    {
      "id": "lab-dragdrop-1",
      "type": "DRAGDROP",
      "question": "Drag each animal to the correct group.",
      "categories": ["Land", "Water"],
      "items": [
        { "id": "dog",   "label": "Dog",   "category": "Land" },
        { "id": "fish",  "label": "Fish",  "category": "Water" },
        { "id": "cat",   "label": "Cat",   "category": "Land" },
        { "id": "whale", "label": "Whale", "category": "Water" }
      ]
    },

    {
      "id": "lab-sort-1",
      "type": "SORT",
      "question": "Arrange these numbers from smallest to largest.",
      "items": ["8", "2", "5", "1"],
      "answer": ["1", "2", "5", "8"],
      "metadata": {
        "type": "ordering-numbers",
        "direction": "ascending"
      }
    },
    {
      "id": "lab-sort-2",
      "type": "SORT",
      "question": "Arrange these numbers from largest to smallest.",
      "items": ["3", "9", "6", "1"],
      "answer": ["9", "6", "3", "1"],
      "metadata": {
        "type": "ordering-numbers",
        "direction": "descending"
      }
    },

    {
      "id": "lab-shapehunt-1",
      "type": "SHAPE_HUNT",
      "question": "Tap all the triangles!",
      "targetShape": "triangle",
      "shapes": [
        { "id": "s1", "shape": "triangle", "x": 0.2, "y": 0.3 },
        { "id": "s2", "shape": "circle",   "x": 0.6, "y": 0.2 },
        { "id": "s3", "shape": "triangle", "x": 0.75, "y": 0.6 },
        { "id": "s4", "shape": "square",   "x": 0.4, "y": 0.65 },
        { "id": "s5", "shape": "triangle", "x": 0.5, "y": 0.15 },
        { "id": "s6", "shape": "rectangle","x": 0.15, "y": 0.7 }
      ],
      "answer": ["s1", "s3", "s5"]
    },

    {
      "id": "lab-ordinal-1",
      "type": "ORDINAL_SEQUENCE",
      "question": "What is the 3rd fruit in the row?",
      "sequence": ["🍎", "🍌", "🍇", "🍊", "🍓"],
      "targetPosition": 3,
      "answer": "🍇",
      "metadata": {
        "type": "ordinal-sequence"
      }
    },

    {
      "id": "lab-connectdots-1",
      "type": "CONNECTDOTS",
      "question": "Connect the dots from 1 to 5 to draw a star!",
      "pegs": [
        { "label": "1", "x": 0.50, "y": 0.10 },
        { "label": "2", "x": 0.85, "y": 0.45 },
        { "label": "3", "x": 0.70, "y": 0.85 },
        { "label": "4", "x": 0.30, "y": 0.85 },
        { "label": "5", "x": 0.15, "y": 0.45 }
      ],
      "answer": ["1", "2", "3", "4", "5"]
    },
    {
      "id": "lab-connectdots-2",
      "type": "CONNECTDOTS",
      "question": "Connect the dots from 1 to 4 to draw a square!",
      "pegs": [
        { "label": "1", "x": 0.20, "y": 0.15 },
        { "label": "2", "x": 0.80, "y": 0.15 },
        { "label": "3", "x": 0.80, "y": 0.85 },
        { "label": "4", "x": 0.20, "y": 0.85 }
      ],
      "answer": ["1", "2", "3", "4"]
    },

    {
      "id": "lab-shapetracer-1",
      "type": "SHAPETRACER",
      "question": "Trace the triangle with your finger!",
      "shape": "triangle",
      "traceMode": "guided",
      "answer": "Triangle"
    },
    {
      "id": "lab-shapetracer-2",
      "type": "SHAPETRACER",
      "question": "Trace the square!",
      "shape": "square",
      "traceMode": "guided",
      "answer": "Square"
    },
    {
      "id": "lab-shapetracer-3",
      "type": "SHAPETRACER",
      "question": "Trace the rectangle with less help.",
      "shape": "rectangle",
      "traceMode": "semi_guided",
      "answer": "Rectangle"
    },
    {
      "id": "lab-shapetracer-4",
      "type": "SHAPETRACER",
      "question": "Trace the triangle — just the corner dots to guide you!",
      "shape": "triangle",
      "traceMode": "freeform",
      "answer": "Triangle"
    },

    {
      "id": "lab-geoboard-1",
      "type": "GEOBOARD",
      "question": "Tap 3 dots to draw a triangle!",
      "shape": "triangle",
      "traceMode": "free",
      "answer": "triangle"
    },
    {
      "id": "lab-geoboard-2",
      "type": "GEOBOARD",
      "question": "Tap 4 dots to draw a square!",
      "shape": "square",
      "traceMode": "free",
      "answer": "square"
    },
    {
      "id": "lab-geoboard-3",
      "type": "GEOBOARD",
      "question": "Tap 4 dots to draw a rectangle!",
      "shape": "rectangle",
      "traceMode": "free",
      "answer": "rectangle"
    },
    {
      "id": "lab-geoboard-4",
      "type": "GEOBOARD",
      "question": "Follow the hint and draw a triangle!",
      "shape": "triangle",
      "traceMode": "guided",
      "answer": "triangle"
    },


<!-- FOR CLOCK ENGINE SPECIFIC MODE HOUR ONLY OR HALF HOUR -->
    {
      "id": "lab-clocksetter-1",
      "type": "NUMPAD",
      "question": "Set the clock to 3 o'clock!",
      "targetTime": { "hour": 3, "minute": 0 },
      "initialTime": { "hour": 12, "minute": 0 },
      "mode": "hour-only"
    },
    {
      "id": "lab-clocksetter-2",
      "type": "CLOCKSETTER",
      "question": "What time is 7 o'clock? Set the clock!",
      "targetTime": { "hour": 7, "minute": 0 },
      "initialTime": { "hour": 12, "minute": 0 },
      "mode": "hour-only"
    },
    {
      "id": "lab-clocksetter-3",
      "type": "CLOCKSETTER",
      "question": "Set the clock to 3:30!",
      "targetTime": { "hour": 3, "minute": 30 },
      "initialTime": { "hour": 12, "minute": 0 },
      "mode": "half-hour"
    },
    {
      "id": "lab-clocksetter-4",
      "type": "CLOCKSETTER",
      "question": "Set the clock to 9:30!",
      "targetTime": { "hour": 9, "minute": 30 },
      "initialTime": { "hour": 12, "minute": 0 },
      "mode": "half-hour"
    },

     {
      "id": "lab-wordproblem-8",
      "type": "WORD_PROBLEM",
      "question": "Juan has 3 toy cars. Maria gives him 2 more. How many toy cars does Juan have now?",
      "assetId": "icon_toy_car",
      "answer": 5,
      "maxDigits": 1
    },
    {
      "id": "lab-wordproblem-9",
      "type": "WORD_PROBLEM",
      "question": "There are 7 mangoes in a basket. You ate 3. How many mangoes are left? 7 + 3",
      "assetId": "icon_mango",
      "answer": 4,
      "maxDigits": 1
    }
    {
      "id": "lab-picker-2",
      "type": "PICKER",
      "question": "What is 3 + 4?",
      "answer": "7",
      "metadata": {
        "options": ["5", "6", "7"]
      }
    },

    {
      "id": "lab-numpad-1",
      "type": "NUMPAD",
      "question": "What is 5 + 3?",
      "equation": { "left": "5 + 3", "operator": "=", "blank": "right" },
      "answer": 8,
      "maxDigits": 2
    },
     {
      "id": "lab-geoboard-1",
      "type": "GEOBOARD",
      "question": "Follow the hint and draw a triangle!",
      "shape": "triangle",
      "traceMode": "guided",
      "answer": "triangle"
    },
    {
      "id": "lab-geoboard-2",
      "type": "GEOBOARD",
      "question": "Now, can you draw a square?",
      "shape": "square",
      "traceMode": "guided",
      "answer": "square"
    },
    {
      "id": "lab-geoboard-3",
      "type": "GEOBOARD",
      "question": "Can you form a rectangle on the board?",
      "shape": "rectangle",
      "traceMode": "guided",
      "answer": "rectangle"
    },
    {
      "id": "lab-shapetracer-1",
      "type": "SHAPETRACER",
      "question": "Trace the triangle with your finger!",
      "shape": "triangle",
      "traceMode": "guided",
      "answer": "triangle"
    },
    {
      "id": "lab-shapetracer-2",
      "type": "SHAPETRACER",
      "question": "Trace the square with your finger!",
      "shape": "square",
      "traceMode": "guided",
      "answer": "square"
    },
    {
      "id": "lab-shapetracer-3",
      "type": "SHAPETRACER",
      "question": "Trace the rectangle with your finger!",
      "shape": "rectangle",
      "traceMode": "guided",
      "answer": "rectangle"
    },
    {
      "id": "lab-clocksetter-6",
      "type": "CLOCKSETTER",
      "question": "Set the clock to 5:45!",
      "targetTime": { "hour": 5, "minute": 45 },
      "initialTime": { "hour": 12, "minute": 0 },
      "mode": "quarter-hour"
    },
    {
      "id": "lab-composer-7",
      "type": "COMPOSER",
      "question": "Find two numbers that make 8!",
      "target": 8,
      "chips": [2, 3, 4, 5, 6],
      "mode": "compose"
    },