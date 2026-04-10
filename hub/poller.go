package hub

import (
	"context"
	"log"
	"sync"
	"time"
)

type pollingTier string

const (
	tierFast   pollingTier = "fast"
	tierNormal pollingTier = "normal"
)

func (t pollingTier) interval() time.Duration {
	switch t {
	case tierFast:
		return 3 * time.Second
	default:
		return 15 * time.Second
	}
}

type pollerEntry struct {
	cancel   context.CancelFunc
	tier     pollingTier
	lastBeat time.Time
	mu       sync.Mutex
}

type Poller struct {
	hub     *Hub
	entries map[string]*pollerEntry
	mu      sync.Mutex
	done    chan struct{}
}

func newPoller(hub *Hub) *Poller {
	return &Poller{
		hub:     hub,
		entries: make(map[string]*pollerEntry),
		done:    make(chan struct{}),
	}
}

func (p *Poller) Start() {
	go p.demotionChecker()
}

func (p *Poller) Heartbeat(wid string, tier pollingTier) {
	if tier != tierFast && tier != tierNormal {
		tier = tierNormal
	}

	p.mu.Lock()
	entry, exists := p.entries[wid]
	if !exists {
		ctx, cancel := context.WithCancel(context.Background())
		entry = &pollerEntry{
			cancel:   cancel,
			tier:     tier,
			lastBeat: time.Now(),
		}
		p.entries[wid] = entry
		p.mu.Unlock()
		go p.run(wid, ctx)
		return
	}
	p.mu.Unlock()

	entry.mu.Lock()
	entry.tier = tier
	entry.lastBeat = time.Now()
	entry.mu.Unlock()
}

func (p *Poller) Stop(wid string) {
	p.mu.Lock()
	entry, exists := p.entries[wid]
	if exists {
		entry.cancel()
		delete(p.entries, wid)
	}
	p.mu.Unlock()
}

func (p *Poller) StopAll() {
	close(p.done)

	p.mu.Lock()
	for wid, entry := range p.entries {
		entry.cancel()
		delete(p.entries, wid)
	}
	p.mu.Unlock()
}

func (p *Poller) run(wid string, ctx context.Context) {
	log.Printf("[poller] workspace %s: started", wid)
	defer log.Printf("[poller] workspace %s: stopped", wid)

	for {
		p.mu.Lock()
		entry, exists := p.entries[wid]
		p.mu.Unlock()
		if !exists {
			return
		}

		entry.mu.Lock()
		interval := entry.tier.interval()
		entry.mu.Unlock()

		ws, err := p.hub.App.FindRecordById("workspaces", wid)
		if err != nil {
			log.Printf("[poller] workspace %s: not found, stopping", wid)
			p.Stop(wid)
			return
		}

		p.hub.pollWorkspaceInstances(ws)

		select {
		case <-ctx.Done():
			return
		case <-p.done:
			return
		case <-time.After(interval):
		}
	}
}

func (p *Poller) demotionChecker() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-p.done:
			return
		case <-ticker.C:
			p.checkDemotions()
		}
	}
}

func (p *Poller) checkDemotions() {
	now := time.Now()

	p.mu.Lock()
	wids := make([]string, 0, len(p.entries))
	for wid := range p.entries {
		wids = append(wids, wid)
	}
	p.mu.Unlock()

	for _, wid := range wids {
		p.mu.Lock()
		entry, exists := p.entries[wid]
		p.mu.Unlock()
		if !exists {
			continue
		}

		entry.mu.Lock()
		elapsed := now.Sub(entry.lastBeat)
		currentTier := entry.tier
		entry.mu.Unlock()

		if elapsed > 5*time.Minute {
			log.Printf("[poller] workspace %s: no heartbeat for %s, stopping", wid, elapsed.Truncate(time.Second))
			p.Stop(wid)
		} else if elapsed > 60*time.Second && currentTier == tierFast {
			log.Printf("[poller] workspace %s: demoting to normal", wid)
			entry.mu.Lock()
			entry.tier = tierNormal
			entry.mu.Unlock()
		}
	}
}
