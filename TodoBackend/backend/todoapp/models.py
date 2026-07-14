from django.db import models
from django.contrib.auth.models import User


class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    text = models.CharField(max_length=500)
    completed = models.BooleanField(default=False)
    date = models.CharField(max_length=10, default='')
    due_date = models.CharField(max_length=10, default='')
    category = models.CharField(max_length=50, default='personal')
    priority = models.CharField(max_length=20, default='medium')
    important = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.text
