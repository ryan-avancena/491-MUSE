console.log("Visualizer JS loaded");

fetch("/static/data/visualization_embeddings.json")
.then(response => response.json())
.then(data => {
  const x = data.map(d => d.x);
  const y = data.map(d => d.y);
  const z = data.map(d => d.z || Math.random() * 2 - 1); // If no z, random depth

  const trace = {
    x: Array(x.length).fill(0), // animate from center
    y: Array(y.length).fill(0),
    z: Array(z.length).fill(0),
    text: data.map(d => `${d.Title} by ${d.Artist}`),
    customdata: data.map(d => d.ID),
    mode: "markers",
    type: "scatter3d",
    marker: {
      size: 5,
      color: "#FFEB53",
      opacity: 0.8,
      line: {
        width: 0.5,
        color: "#000000"
      }
    },
    hovertemplate: "<b>%{text}</b><extra></extra>"
  };

  const layout = {
    margin: { l: 0, r: 0, b: 0, t: 0 },
    scene: {
        xaxis: {
          showgrid: true,
          gridcolor: "#333",
          zeroline: false,
          showbackground: true,
          backgroundcolor: "#000",
          color: "#888"
        },
        yaxis: {
          showgrid: true,
          gridcolor: "#333",
          zeroline: false,
          showbackground: true,
          backgroundcolor: "#000",
          color: "#888"
        },
        zaxis: {
          showgrid: true,
          gridcolor: "#333",
          zeroline: false,
          showbackground: true,
          backgroundcolor: "#000",
          color: "#888"
        },
        bgcolor: "black"
      },
    paper_bgcolor: "black",
    hovermode: "closest"
  };

  Plotly.newPlot("visualizer", [trace], layout).then(() => {
    Plotly.animate("visualizer", {
      data: [{ x: x, y: y, z: z }],
      traces: [0],
      layout: {}
    }, {
      transition: {
        duration: 1000,
        easing: "cubic-in-out"
      },
      frame: {
        duration: 1000
      }
    });

    // Rotate the camera
    let angle = 0;
    setInterval(() => {
      angle += 0.01;
      const camera = {
        eye: {
          x: 1.5 * Math.cos(angle),
          y: 1.5 * Math.sin(angle),
          z: 0.5
        }
      };
      Plotly.relayout('visualizer', {
        'scene.camera': camera
      });
    }, 50);

    // Click event
    const visualizerDiv = document.getElementById("visualizer");
    visualizerDiv.on('plotly_click', function(data) {
      const songID = data.points[0].customdata;
      console.log("Clicked song ID:", songID);
    });
  });
});
