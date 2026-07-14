from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from rest_framework import status
from .models import Task


class AuthTests(TestCase):
    """Tests for user registration and login endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/register/'
        self.login_url = '/api/login/'

    def test_register_success(self):
        data = {'name': 'Alice', 'email': 'alice@test.com', 'password': 'securepass123'}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user_name'], 'Alice')

    def test_register_duplicate_email(self):
        User.objects.create_user(username='bob@test.com', email='bob@test.com', password='pass')
        data = {'name': 'Bob', 'email': 'bob@test.com', 'password': 'pass'}
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_register_missing_fields(self):
        response = self.client.post(self.register_url, {'email': 'nopass@test.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        User.objects.create_user(username='carol@test.com', email='carol@test.com', password='mypassword')
        data = {'username': 'carol@test.com', 'password': 'mypassword'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_login_wrong_password(self):
        User.objects.create_user(username='dave@test.com', password='correct')
        response = self.client.post(self.login_url, {'username': 'dave@test.com', 'password': 'wrong'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TaskCRUDTests(TestCase):
    """Tests for the tasks CRUD API (authenticated)."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='user@test.com', email='user@test.com', password='testpassword', first_name='TestUser'
        )
        self.token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        self.tasks_url = '/api/tasks/'

    def _create_task(self, text='Sample task', **kwargs):
        payload = {'text': text, 'dueDate': '2026-08-01', 'category': 'personal', 'priority': 'medium', **kwargs}
        return self.client.post(self.tasks_url, payload, format='json')

    # ── LIST ──
    def test_list_tasks_empty(self):
        response = self.client.get(self.tasks_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_list_tasks_only_own(self):
        """Users should only see their own tasks."""
        other_user = User.objects.create_user(username='other@test.com', password='pass')
        Task.objects.create(user=other_user, text='Other user task', date='2026-08-01')
        self._create_task('My task')
        response = self.client.get(self.tasks_url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['text'], 'My task')

    # ── CREATE ──
    def test_create_task(self):
        response = self._create_task('Buy groceries')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['text'], 'Buy groceries')
        self.assertFalse(response.data['completed'])
        self.assertFalse(response.data['important'])

    def test_create_task_with_all_fields(self):
        payload = {
            'text': 'Study for exam',
            'dueDate': '2026-09-01',
            'category': 'study',
            'priority': 'high',
            'important': True,
        }
        response = self.client.post(self.tasks_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['category'], 'study')
        self.assertEqual(response.data['priority'], 'high')
        self.assertTrue(response.data['important'])

    def test_create_task_missing_text(self):
        response = self.client.post(self.tasks_url, {'dueDate': '2026-08-01'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── RETRIEVE ──
    def test_retrieve_task(self):
        task = Task.objects.create(user=self.user, text='Read book', date='2026-08-01')
        response = self.client.get(f'{self.tasks_url}{task.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['text'], 'Read book')

    def test_retrieve_other_user_task_forbidden(self):
        other = User.objects.create_user(username='other2@test.com', password='pass')
        task = Task.objects.create(user=other, text='Private task', date='2026-08-01')
        response = self.client.get(f'{self.tasks_url}{task.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── UPDATE ──
    def test_update_task_text(self):
        task = Task.objects.create(user=self.user, text='Old text', date='2026-08-01')
        response = self.client.patch(f'{self.tasks_url}{task.id}/', {'text': 'New text'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['text'], 'New text')

    def test_toggle_completed(self):
        task = Task.objects.create(user=self.user, text='Task', date='2026-08-01')
        self.assertFalse(task.completed)
        response = self.client.patch(f'{self.tasks_url}{task.id}/', {'completed': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['completed'])

    def test_toggle_important(self):
        task = Task.objects.create(user=self.user, text='Task', date='2026-08-01')
        response = self.client.patch(f'{self.tasks_url}{task.id}/', {'important': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['important'])

    def test_update_other_user_task_forbidden(self):
        other = User.objects.create_user(username='other3@test.com', password='pass')
        task = Task.objects.create(user=other, text='Private', date='2026-08-01')
        response = self.client.patch(f'{self.tasks_url}{task.id}/', {'text': 'Hacked'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── DELETE ──
    def test_delete_task(self):
        task = Task.objects.create(user=self.user, text='Delete me', date='2026-08-01')
        response = self.client.delete(f'{self.tasks_url}{task.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=task.id).exists())

    def test_delete_other_user_task_forbidden(self):
        other = User.objects.create_user(username='other4@test.com', password='pass')
        task = Task.objects.create(user=other, text='Not mine', date='2026-08-01')
        response = self.client.delete(f'{self.tasks_url}{task.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── AUTH GUARD ──
    def test_unauthenticated_cannot_list_tasks(self):
        self.client.credentials()  # clear credentials
        response = self.client.get(self.tasks_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_cannot_create_task(self):
        self.client.credentials()
        response = self.client.post(self.tasks_url, {'text': 'Sneaky'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
