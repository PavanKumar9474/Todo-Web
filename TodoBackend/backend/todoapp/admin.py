from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('text', 'user', 'category', 'priority', 'completed', 'important', 'date', 'due_date', 'created_at')
    list_filter = ('completed', 'important', 'category', 'priority')
    search_fields = ('text', 'user__username', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    list_select_related = ('user',)
