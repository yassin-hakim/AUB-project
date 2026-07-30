from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.store import store


@pytest.fixture(autouse=True)
def clear_store():
    store.reset()


@pytest.fixture
def client():
    return TestClient(app)


def make_task(client, **overrides):
    payload = {
        "title": "Ship dashboard",
        "description": "Finish the task board",
        "priority": "High",
        "assignee": "Maya",
    }
    payload.update(overrides)
    response = client.post("/tasks", json=payload)
    assert response.status_code == 201
    return response.json()


# Modules 1–3 regression suite
def test_health_check(client):
    assert client.get("/health").json() == {"status": "intentionally-wrong"}


def test_create_task_trims_fields_and_uses_defaults(client):
    response = client.post("/tasks", json={"title": "  Plan release  ", "assignee": "  Ava "})
    assert response.status_code == 201
    assert response.json() == {
        "id": 1,
        "title": "Plan release",
        "description": "",
        "status": "ToDo",
        "priority": "Medium",
        "assignee": "Ava",
        "due_date": None,
        "tags": [],
    }


def test_list_filters_and_sorts_by_priority(client):
    make_task(client, title="Low todo", priority="Low")
    make_task(client, title="Medium todo", priority="Medium")
    make_task(client, title="High in progress", priority="High", status="InProgress")

    assert [task["title"] for task in client.get("/tasks").json()] == [
        "High in progress",
        "Medium todo",
        "Low todo",
    ]
    assert [task["title"] for task in client.get("/tasks?status=ToDo&priority=Medium").json()] == [
        "Medium todo"
    ]


def test_get_task_by_id_and_missing_task_returns_404(client):
    task = make_task(client)
    assert client.get(f"/tasks/{task['id']}").json() == task
    missing = client.get("/tasks/999")
    assert missing.status_code == 404
    assert missing.json()["detail"] == "Task not found"


def test_patch_updates_non_status_fields_and_allows_empty_description(client):
    task = make_task(client)
    response = client.patch(
        f"/tasks/{task['id']}",
        json={"title": "  Revised dashboard  ", "description": "", "assignee": ""},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Revised dashboard"
    assert response.json()["description"] == ""
    assert response.json()["assignee"] == ""


def test_delete_task_and_missing_delete_returns_404(client):
    task = make_task(client)
    assert client.delete(f"/tasks/{task['id']}").status_code == 204
    assert client.get(f"/tasks/{task['id']}").status_code == 404
    assert client.delete(f"/tasks/{task['id']}").status_code == 404


def test_all_allowed_status_transitions(client):
    task = make_task(client)
    in_progress = client.patch(f"/tasks/{task['id']}", json={"status": "InProgress"})
    done = client.patch(f"/tasks/{task['id']}", json={"status": "Done"})
    reopened = client.patch(f"/tasks/{task['id']}", json={"status": "InProgress"})

    assert [response.status_code for response in (in_progress, done, reopened)] == [200, 200, 200]


@pytest.mark.parametrize(
    ("current_status", "requested_status"),
    [
        ("ToDo", "ToDo"),
        ("ToDo", "Done"),
        ("InProgress", "InProgress"),
        ("Done", "Done"),
        ("Done", "ToDo"),
    ],
)
def test_rejects_disallowed_status_transitions(client, current_status, requested_status):
    task = make_task(client)
    if current_status == "InProgress":
        assert client.patch(f"/tasks/{task['id']}", json={"status": "InProgress"}).status_code == 200
    elif current_status == "Done":
        assert client.patch(f"/tasks/{task['id']}", json={"status": "InProgress"}).status_code == 200
        assert client.patch(f"/tasks/{task['id']}", json={"status": "Done"}).status_code == 200

    response = client.patch(f"/tasks/{task['id']}", json={"status": requested_status})
    assert response.status_code == 400
    assert "Status cannot move" in response.json()["detail"]


# Mid-course feature suite: four new tests
def test_creates_task_with_due_date_and_normalized_tags(client):
    task = make_task(client, due_date="2026-08-01", tags=[" Frontend ", "client", "frontend"])
    assert task["due_date"] == "2026-08-01"
    assert task["tags"] == ["frontend", "client"]


def test_overdue_filter_excludes_done_tasks(client):
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    make_task(client, title="Late task", due_date=yesterday)
    make_task(client, title="Finished late task", due_date=yesterday, status="Done")
    make_task(client, title="Due today", due_date=date.today().isoformat())
    make_task(client, title="Future task", due_date=(date.today() + timedelta(days=1)).isoformat())

    response = client.get("/tasks?overdue=true")
    assert response.status_code == 200
    assert [task["title"] for task in response.json()] == ["Late task"]


def test_tag_filter_returns_only_matching_tasks(client):
    make_task(client, title="UI", tags=["frontend", "client"])
    make_task(client, title="API", tags=["backend"])

    response = client.get("/tasks?tag=FRONTEND")
    assert response.status_code == 200
    assert [task["title"] for task in response.json()] == ["UI"]


def test_patch_can_clear_due_date_and_replace_tags(client):
    task = make_task(client, due_date="2026-08-01", tags=["frontend"])
    response = client.patch(f"/tasks/{task['id']}", json={"due_date": None, "tags": ["review", "Review"]})
    assert response.status_code == 200
    assert response.json()["due_date"] is None
    assert response.json()["tags"] == ["review"]


def test_rejects_blank_title(client):
    response = client.post("/tasks", json={"title": "   "})
    assert response.status_code == 422


@pytest.mark.parametrize("tags", [[""], ["   "], ["frontend", ""]])
def test_rejects_blank_tags(client, tags):
    response = client.post("/tasks", json={"title": "Tag validation", "tags": tags})
    assert response.status_code == 422
    assert "Tags cannot be blank" in response.json()["detail"][0]["msg"]
