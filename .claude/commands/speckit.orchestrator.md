---
description: Lance le workflow d'implémentation complet avec une équipe d'agents : QA spec, Engineers par US (parallèle si indépendants), Tester, QA code, PR finale.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**
   - Exécute `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` depuis la racine du repo
   - Parse FEATURE_DIR et AVAILABLE_DOCS
   - Lis `tasks.md` → groupe les tâches par `[USN]`, liste les fichiers touchés par chaque US
   - `git rev-parse --abbrev-ref HEAD` → <feature_branch>
   - `git config --get remote.origin.url` → vérifie que c'est un repo GitHub (sinon, skip les étapes PR)
   - Lis `specs/<feature>/github-issue.txt` si présent → <issue_number>

2. **QA pré-implémentation**
   - Invoque l'agent `qa-engineer` via le Task tool (mode SPEC) en lui fournissant le chemin absolu de FEATURE_DIR
   - Si le rapport contient des items CRITICAL : affiche-les à l'utilisateur et demande confirmation avant de continuer

3. **Analyse des dépendances entre USs**
   - Pour chaque US identifiée dans tasks.md : liste les fichiers touchés
   - Identifie les USs indépendantes (ensembles de fichiers disjoints) → peuvent tourner EN PARALLÈLE
   - Identifie les USs dépendantes (fichiers partagés) → doivent tourner SÉQUENTIELLEMENT
   - Affiche le plan d'exécution à l'utilisateur avant de lancer

4. **Déploiement des Engineers**
   - Pour les USs **indépendantes** : invoque les agents `engineer` EN PARALLÈLE (Task tool, un appel par US dans le même message)
   - Pour les USs **dépendantes** : invoque séquentiellement (attends la fin d'une US avant de lancer la suivante)
   - Chaque invocation `engineer` reçoit dans son prompt :
     - Numéro de US (N)
     - Nom de la feature branch (<feature_branch>)
     - Chemin absolu de FEATURE_DIR
     - Liste exacte des tâches [USN] à implémenter
   - Collecte les rapports de chaque Engineer : PR URL + liste des fichiers modifiés

5. **Validation par le Tester**
   - Invoque l'agent `tester` via le Task tool en lui fournissant FEATURE_DIR et les commandes de test de plan.md
   - Si le Tester signale des échecs : renvoie l'agent `engineer` de l'US responsable avec les détails exacts de l'erreur
   - Attends le rapport final vert du Tester

6. **QA post-implémentation**
   - Invoque l'agent `qa-engineer` (mode CODE) avec FEATURE_DIR
   - Affiche le rapport à l'utilisateur

7. **PR finale** (seulement si remote est GitHub)
   - `git checkout <feature_branch>`
   - `git push -u origin <feature_branch>`
   - Construis la liste des US PRs depuis les rapports Engineers
   - Construis le résumé des tests depuis le rapport Tester
   ```bash
   gh pr create --title "feat: <feature_branch>" \
     --base <default_branch> \
     --body "$(cat <<'EOF'
   ## Summary

   <résumé de l'implémentation>

   ## User Stories implémentées

   <liste des PRs par US>

   ## Résultats des tests

   <tableau du rapport Tester>

   Closes #<issue_number>
   EOF
   )"
   ```
   - Affiche l'URL de la PR finale à l'utilisateur
