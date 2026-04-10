package main

import (
	"log"
	"os"

	_ "github.com/whatsmiau/manager/migrations"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/whatsmiau/manager/hub"
)

var Version = "dev"

func main() {
	isDev := os.Getenv("ENV") == "dev"

	app := pocketbase.NewWithConfig(pocketbase.Config{
		DefaultDataDir: "pb_data",
		DefaultDev:     isDev,
	})

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: isDev,
		Dir:         "migrations",
	})

	hub.NewHub(app, Version).Start()

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
