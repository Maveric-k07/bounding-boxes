import React, { useEffect, useState, useRef, useCallback } from "react";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

export default function CustomPdfReader({ url }) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  const canvasRef = useRef();
  const [pdfRef, setPdfRef] = useState("");
  const currentPage = 1;
  const zoomScale = 1;
  const rotateAngle = 0;
  var pdf_image = "";
  const renderPage = useCallback(
    (pageNum, pdf = pdfRef) => {
      pdf &&
        pdf.getPage(pageNum).then(function (page) {
          const viewport = page.getViewport({
            scale: zoomScale,
            rotation: rotateAngle,
          });
          const canvas = canvasRef.current;
          canvas.height = viewport?.height;
          canvas.width = viewport?.width;
          const renderContext = {
            canvasContext: canvas?.getContext("2d"),
            viewport: viewport,
            textContent: pdfRef,
          };

          page.render(renderContext);
        });
    },
    [pdfRef, url]
  );
  useEffect(() => {
    if (url.slice(-4).toLowerCase() === ".pdf") {
      renderPage(currentPage, pdfRef);
    } else {
      setPdfRef("");
    }
  }, [pdfRef, renderPage, url]);

  useEffect(() => {
    const loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(
      (loadedPdf) => {
        setPdfRef(loadedPdf);
      },
      function (reason) {
        console.error(reason);
      }
    );
  }, [url]);

  var cursorInCanvas = false;
  var canvasOfDoc = canvasRef?.current;
  var ctx;
  var startX;
  var startY;
  var offsetX;
  var offsetY;

  const saveInitialCanvas = () => {
    if (canvasOfDoc?.getContext) {
      var canvasPic = new Image();
      canvasPic.src = canvasOfDoc.toDataURL();
      pdf_image = canvasPic;
    }
  };

  useEffect(() => {
    if (canvasOfDoc) {
      ctx = canvasOfDoc.getContext("2d");
      var canvasOffset = canvasOfDoc.getBoundingClientRect();
      offsetX = canvasOffset.left;
      offsetY = canvasOffset.top;
    }
  }, [canvasOfDoc, pdfRef, renderPage, url]);

  function handleMouseIn(e) {
    if (typeof pdf_image == "string") {
      saveInitialCanvas();
    }
    e.preventDefault();
    e.stopPropagation();
    startX = ((e.offsetX * canvasOfDoc.width) / canvasOfDoc.clientWidth) | 0;
    startY = ((e.offsetY * canvasOfDoc.width) / canvasOfDoc.clientWidth) | 0;

    cursorInCanvas = true;
  }

  function handleMouseOut(e) {
    e.preventDefault();
    e.stopPropagation();
    cursorInCanvas = false;
  }

  function handleMouseMove(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!cursorInCanvas) {
      return;
    }
    let mouseX =
      ((e.offsetX * canvasOfDoc.width) / canvasOfDoc.clientWidth) | 0;
    let mouseY =
      ((e.offsetY * canvasOfDoc.width) / canvasOfDoc.clientWidth) | 0;

    var width = mouseX - startX;
    var height = mouseY - startY;
    if (ctx) {
      ctx?.clearRect(0, 0, canvasOfDoc.width, canvasOfDoc.height);
      ctx?.drawImage(pdf_image, 0, 0);
      ctx.beginPath();
      ctx.rect(startX, startY, width, height);
      ctx.strokeStyle = "#1B9AFF";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  canvasOfDoc?.addEventListener("mousedown", function (e) {
    handleMouseIn(e);
  });
  canvasOfDoc?.addEventListener("mousemove", function (e) {
    handleMouseMove(e);
  });
  canvasOfDoc?.addEventListener("mouseup", function (e) {
    handleMouseOut(e);
  });
  canvasOfDoc?.addEventListener("mouseout", function (e) {
    handleMouseOut(e);
  });

  return (
    <>
      <canvas id="pdf-doc" ref={canvasRef} />
    </>
  );
}
