REPO="gbtunney/gbt-schema-form"
gh label list -R "$REPO" --limit 1000 --json name --jq '.[].name' \
    | while IFS= read -r name; do
        gh label delete -R "$REPO" "$name" --yes
    done
