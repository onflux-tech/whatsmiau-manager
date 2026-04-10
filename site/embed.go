package site

import (
	"embed"
	"io/fs"
)

//go:embed all:dist
var distDir embed.FS

var DistDirFS, _ = fs.Sub(distDir, "dist")
