
const fs = require("fs");
const path = require("path");

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === "ENOENT" || err.code === "EPERM") return;
      throw err;
    }
  });
  return filelist;
}

const files = walkSync("C:/Users/Admin/OneDrive/Desktop/Carbon Footprint/frontend/src").filter(f => f.endsWith(".jsx"));

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  
  // Replace "bg-white border-slate-200" with "bg-white border-slate-200 shadow-md"
  // but only if it doesn"t already have shadow-
  let newContent = content.replace(/bg-white border-slate-200(?! shadow-)/g, "bg-white border-slate-200 shadow-md");
  
  // Replace existing shadow-sm with shadow-md for more elevation
  newContent = newContent.replace(/bg-white border-slate-200 shadow-sm/g, "bg-white border-slate-200 shadow-md");

  // Replace dark mode equivalents too
  // "bg-gray-800 border-gray-700" -> "bg-gray-800 border-gray-700 shadow-md shadow-black/20"
  newContent = newContent.replace(/bg-gray-800 border-gray-700(?! shadow-)/g, "bg-gray-800 border-gray-700 shadow-md shadow-black/20");
  newContent = newContent.replace(/bg-gray-800 border-gray-700 shadow-sm/g, "bg-gray-800 border-gray-700 shadow-md shadow-black/20");

  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log("Updated: " + file);
  }
});

