from collections.abc import Iterable
from datetime import date

from app.models import Priority, Status, Task, TaskCreate, TaskUpdate


class TaskStore:
    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self._tasks: dict[int, Task] = {}
        self._next_id = 1

    def list(
        self,
        *,
        status: Status | None = None,
        priority: Priority | None = None,
        tag: str | None = None,
        overdue: bool = False,
    ) -> list[Task]:
        tasks: Iterable[Task] = self._tasks.values()
        today = date.today()
        if status:
            tasks = (task for task in tasks if task.status == status)
        if priority:
            tasks = (task for task in tasks if task.priority == priority)
        if tag:
            normalized_tag = tag.strip().lower()
            tasks = (task for task in tasks if normalized_tag in task.tags)
        if overdue:
            tasks = (
                task
                for task in tasks
                if task.due_date is not None and task.due_date < today and task.status != Status.DONE
            )
        priority_order = {Priority.HIGH: 0, Priority.MEDIUM: 1, Priority.LOW: 2}
        return sorted(tasks, key=lambda task: (priority_order[task.priority], task.id))

    def create(self, payload: TaskCreate) -> Task:
        task = Task(id=self._next_id, **payload.model_dump())
        self._tasks[task.id] = task
        self._next_id += 1
        return task

    def get(self, task_id: int) -> Task | None:
        return self._tasks.get(task_id)

    def update(self, task_id: int, payload: TaskUpdate) -> Task | None:
        current = self.get(task_id)
        if current is None:
            return None
        values = payload.model_dump(exclude_unset=True)
        updated = current.model_copy(update=values)
        self._tasks[task_id] = updated
        return updated

    def delete(self, task_id: int) -> bool:
        return self._tasks.pop(task_id, None) is not None


store = TaskStore()
