# TODO
- [ ] Fire-and-forget opportunities
- [ ] Effect.ts
- [ ] Storage update fn
  - [ ] Multi-instance consistency
    - [ ] Much greater level of information needed for reconciliation
  - [ ] Retval of additions & removals
    - [ ] Motivates util fn `hostnamePattern` <-> `hostname`?
  - [ ] Unit test
    - [ ] Invariants / PBT
    - [ ] LLM gen help
- [ ] Indicator
  - [ ] `declarativeContent.onPageChanged`? ((un)register in bulk)

# Notes
Big idea = extension's effects basically concern a few collections of entities.
- Effects
  - Action invocation for immediate activation
  - Opt in to persistent activation
- Entity collections
  - Tabs ready for toggling
  - Hostnames registered
  - Hostnames desired
