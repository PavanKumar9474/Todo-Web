from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    # Frontend/tests use dueDate (camelCase), backend model stores due_date.
    dueDate = serializers.CharField(
        source='due_date',
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = Task
        fields = [
            'id',
            'text',
            'completed',
            'date',
            'dueDate',
            'category',
            'priority',
            'important',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_priority(self, value):
        allowed = {'high', 'medium', 'low'}
        if value and value not in allowed:
            raise serializers.ValidationError('Invalid priority')
        return value

    def validate_category(self, value):
        # Keep permissive to avoid breaking existing data, but normalize empty.
        if not value:
            return 'personal'
        return value

