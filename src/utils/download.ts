
export const download = (url: string, filename: string, type?: string) => {
  // Determine file extension based on type
  let fileExtension = ".mp4";
  if (type === "json") {
    fileExtension = ".json";
  } else if (type === "mp4") {
    fileExtension = ".mp4";
  }

  // Remove existing extension from filename if present
  const cleanFilename = filename.replace(/\.(mp4|json)$/, "");
  const fullFilename = `${cleanFilename}${fileExtension}`;

  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", fullFilename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    })
    .catch((error) => console.error("Download error:", error));
};
