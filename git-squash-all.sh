#!/bin/bash

# Fait un rebase interactif à partir de --root et fusionne tous les commits
git reset $(git commit-tree HEAD^{tree} -m "Squash commit")
