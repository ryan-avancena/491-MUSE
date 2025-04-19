console.log("Visualizer JS loaded");

fetch("/static/data/visualization_embeddings.json")
  .then(response => response.json())
  .then(data => {
    const x = data.map(d => d.x);
    const y = data.map(d => d.y);
    const z = data.map(d => d.z || Math.random() * 2 - 1);
    
    const text = data.map(d => `${d.Title} by ${d.Artist}`);
    const ids = data.map(d => d.ID);

    const trace = {
      x: Array(x.length).fill(0),
      y: Array(y.length).fill(0),
      z: Array(z.length).fill(0),
      text,
      customdata: ids,
      mode: "markers",
      type: "scatter3d",
      marker: {
        size: 5,
        color: "#FFEB53",
        opacity: 0.8,
        line: {
          width: 0.5,
          color: "#000"
        }
      },
      hovertemplate: "<b>%{text}</b><extra></extra>"
    };

    const layout = {
      margin: { l: 0, r: 0, b: 0, t: 0 },
      scene: {
        xaxis: {
          showgrid: true,
          zeroline: false,
          showbackground: true,
          backgroundcolor: "#000",
          color: "#666"
        },
        yaxis: {
          showgrid: true,
          zeroline: false,
          showbackground: true,
          backgroundcolor: "#000",
          color: "#666"
        },
        zaxis: {
          showgrid: true,
          zeroline: false,
          showbackground: true,
          backgroundcolor: "#000",
          color: "#666"
        },
        bgcolor: "black"
      },
      paper_bgcolor: "black",
      hovermode: "closest"
    };

    Plotly.newPlot("visualizer", [trace], layout).then(() => {
      Plotly.animate("visualizer", {
        data: [{ x, y, z }],
        traces: [0]
      }, {
        transition: { duration: 1000, easing: "cubic-in-out" },
        frame: { duration: 1000 }
      });

      // Camera rotation with pause on interaction
      let angle = 0;
      let isUserInteracting = false;
      let interactionTimeout = null;

      document.getElementById("visualizer").on("plotly_relayout", () => {
        isUserInteracting = true;
        clearTimeout(interactionTimeout);
        interactionTimeout = setTimeout(() => {
          isUserInteracting = false;
        }, 1000);
      });

      // Shared state for last annotation
      let lastClickedID = null;

      // Handle table click -> show annotation
      $('#tracksTable tbody').on('click', 'tr', function () {
        const songId = $(this).data('id');
        console.log('Clicked table row with Song ID:', songId);

        if (songId === lastClickedID) return;
        lastClickedID = songId;

        const plotData = document.getElementById("visualizer").data[0];
        const idx = plotData.customdata.findIndex(id => id === songId);
        if (idx === -1) {
          console.warn("Song ID not found in visualizer data");
          return;
        }

        const annotation = {
          x: x[idx],
          y: y[idx],
          z: z[idx],
          text: `<b>${text[idx]}</b>`,
          showarrow: true,
          arrowcolor: "#FFFCE3",
          font: {
            color: "#FFFCE3",
            size: 14
          },
          ax: 0,
          ay: -30
        };

        Plotly.relayout("visualizer", {
          "scene.annotations": [annotation]
        });
      });

      // Handle plot click -> show annotation
      document.getElementById("visualizer").on("plotly_click", function (event) {
        const point = event.points[0];
        const songID = point.customdata;
        const caption = point.text;

        if (songID === lastClickedID) return;
        lastClickedID = songID;

        console.log("Clicked song ID:", songID);

        const annotation = {
          x: point.x,
          y: point.y,
          z: point.z,
          text: `<b>${caption}</b>`,
          showarrow: true,
          arrowcolor: "#FFFCE3",
          font: {
            color: "#FFFCE3",
            size: 14
          },
          ax: 0,
          ay: -30
        };

        Plotly.relayout("visualizer", {
          "scene.annotations": [annotation]
        });
      });
    });
  });
