# curl examples — PRO API

Base URL assumed: `http://localhost:3000`

Set a variable for convenience:

```bash
BASE=http://localhost:3000
```

## Auth

```bash
# Register a student
curl -X POST $BASE/auth/register -H "Content-Type: application/json" -d '{
  "role": "student", "id": 1099, "name": "Test Student", "email": "test.student@vit.edu",
  "department_id": 1, "year": 3, "password": "password123"
}'

# Register a faculty
curl -X POST $BASE/auth/register -H "Content-Type: application/json" -d '{
  "role": "faculty", "id": 2099, "name": "Test Faculty", "email": "test.faculty@vit.edu",
  "department_id": 1, "designation": "Assistant Professor", "password": "password123"
}'

# Register an admin
curl -X POST $BASE/auth/register -H "Content-Type: application/json" -d '{
  "role": "admin", "id": 99, "name": "Test Admin", "email": "test.admin@vit.edu",
  "password": "password123"
}'

# Login (seeded users all use password123)
curl -X POST $BASE/auth/login -H "Content-Type: application/json" -d '{
  "role": "student", "email": "aarav.sharma@vit.edu", "password": "password123"
}'
# -> copy the "token" field from the response for the authenticated calls below
TOKEN="paste-token-here"
```

## Department

```bash
curl $BASE/departments
curl $BASE/departments/1
curl -X POST $BASE/departments -H "Content-Type: application/json" -d '{"department_id": 6, "department_name": "Chemical Engineering"}'
curl -X PUT $BASE/departments/6 -H "Content-Type: application/json" -d '{"department_name": "Chemical Engg."}'
curl -X DELETE $BASE/departments/6
```

## Student

```bash
curl $BASE/students
curl $BASE/students/1001
curl $BASE/students/1001/projects
curl -X POST $BASE/students -H "Content-Type: application/json" -d '{
  "student_id": 1099, "name": "New Student", "email": "new.student@vit.edu",
  "department_id": 1, "year": 2, "credits": 60, "password": "password123", "score": 0
}'
curl -X PUT $BASE/students/1099 -H "Content-Type: application/json" -d '{
  "name": "New Student", "email": "new.student@vit.edu", "department_id": 1, "year": 3, "credits": 90, "score": 65
}'
curl -X DELETE $BASE/students/1099 -H "Authorization: Bearer $TOKEN"
```

## Faculty

```bash
curl $BASE/faculty
curl $BASE/faculty/2001
curl $BASE/faculty/2001/guided-teams
curl -X POST $BASE/faculty -H "Content-Type: application/json" -d '{
  "faculty_id": 2099, "name": "New Faculty", "email": "new.faculty@vit.edu",
  "department_id": 1, "designation": "Assistant Professor", "password": "password123"
}'
curl -X PUT $BASE/faculty/2099 -H "Content-Type: application/json" -d '{
  "name": "New Faculty", "email": "new.faculty@vit.edu", "department_id": 1, "designation": "Associate Professor", "score": 80
}'
curl -X DELETE $BASE/faculty/2099 -H "Authorization: Bearer $TOKEN"
```

## Team

```bash
curl $BASE/teams
curl $BASE/teams/3001
curl -X POST $BASE/teams -H "Content-Type: application/json" -d '{
  "team_id": 3099, "team_name": "Test Squad", "leader_id": 1001, "guide_id": 2001
}'
curl -X PUT $BASE/teams/3099 -H "Content-Type: application/json" -d '{"team_name": "Renamed Squad"}'
curl -X DELETE $BASE/teams/3099

# Team_Member sub-resource
curl $BASE/teams/3001/members
curl -X POST $BASE/teams/3001/members -H "Content-Type: application/json" -d '{"student_id": 1013}'
curl -X DELETE $BASE/teams/3001/members/1013
curl $BASE/team-members
```

## Project

```bash
curl $BASE/projects
curl "$BASE/projects/search?title=smart&domain=AI&department=Computer&technology=Python&year=2025-2026"
curl $BASE/projects/7001
curl $BASE/projects/7001/evaluations
curl $BASE/projects/7001/average-score

curl -X POST $BASE/projects -H "Content-Type: application/json" -d '{
  "project_id": 7099, "title": "Test Project", "abstract": "A demo project.",
  "academic_year": "2025-2026", "team_id": 3001, "status": "ONGOING",
  "git_url": "https://github.com/example/test-project"
}'
curl -X PUT $BASE/projects/7099 -H "Content-Type: application/json" -d '{
  "title": "Test Project Updated", "academic_year": "2025-2026", "team_id": 3001, "status": "COMPLETED",
  "git_url": "https://github.com/example/test-project", "submission_date": "2026-05-01"
}'
curl -X DELETE $BASE/projects/7099

# Project_Technology / Project_Domain / Project_Category
curl $BASE/projects/7001/technologies
curl -X POST $BASE/projects/7001/technologies -H "Content-Type: application/json" -d '{"technology_id": 4001}'
curl -X DELETE $BASE/projects/7001/technologies/4001

curl $BASE/projects/7001/domains
curl -X POST $BASE/projects/7001/domains -H "Content-Type: application/json" -d '{"domain_id": 5002}'
curl -X DELETE $BASE/projects/7001/domains/5002

curl $BASE/projects/7001/categories
curl -X POST $BASE/projects/7001/categories -H "Content-Type: application/json" -d '{"category_id": 6003}'
curl -X DELETE $BASE/projects/7001/categories/6003
```

## Technology / Domain / Category

```bash
curl $BASE/technologies
curl $BASE/technologies/4001
curl -X POST $BASE/technologies -H "Content-Type: application/json" -d '{"technology_id": 4099, "technology_name": "Rust"}'
curl -X PUT $BASE/technologies/4099 -H "Content-Type: application/json" -d '{"technology_name": "Rust Lang"}'
curl -X DELETE $BASE/technologies/4099
curl $BASE/technologies/links/all

curl $BASE/domains
curl $BASE/domains/5001
curl -X POST $BASE/domains -H "Content-Type: application/json" -d '{"domain_id": 5099, "domain_name": "AR/VR"}'
curl -X PUT $BASE/domains/5099 -H "Content-Type: application/json" -d '{"domain_name": "Extended Reality"}'
curl -X DELETE $BASE/domains/5099
curl $BASE/domains/links/all

curl $BASE/categories
curl $BASE/categories/6001
curl -X POST $BASE/categories -H "Content-Type: application/json" -d '{"category_id": 6099, "category_name": "Startup"}'
curl -X PUT $BASE/categories/6099 -H "Content-Type: application/json" -d '{"category_name": "Startup Idea"}'
curl -X DELETE $BASE/categories/6099
curl $BASE/categories/links/all
```

## Evaluation

```bash
curl $BASE/evaluations
curl $BASE/evaluations/8001
curl -X POST $BASE/evaluations -H "Content-Type: application/json" -d '{
  "evaluation_id": 8099, "project_id": 7001, "faculty_id": 2001, "score": 92, "feedback": "Great demo!"
}'
curl -X PUT $BASE/evaluations/8099 -H "Content-Type: application/json" -d '{"score": 95, "feedback": "Updated after resubmission."}'
curl -X DELETE $BASE/evaluations/8099
```
