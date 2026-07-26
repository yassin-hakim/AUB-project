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


def test_creates_task_with_due_date_and_normalized_tags(client):
    task = make_task(client, due_date="2026-08-01", tags=[" Frontend ", "client", "frontend"])
    assert task["due_date"] == "2026-08-01"
    assert task["tags"] == ["frontend", "client"]


def test_overdue_filter_excludes_done_tasks(client):
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    make_task(client, title="Late task", due_date=yesterday)
    make_task(client, title="Finished late task", due_date=yesterday, status="Done")
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
