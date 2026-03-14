#!/bin/bash

source "$(dirname "$0")/sh-logger.sh"

log "Testing sh-logger.sh"

success "Build completed"
info "Running tests"
warn "This is a warning"
critical "System failure"
err "An error occurred"

created "/path/to/file"
skipped "Already done"

step "Processing step"
step "Next step"

log "Test complete"

success "All logger functions working"

