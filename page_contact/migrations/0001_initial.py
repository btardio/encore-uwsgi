# Generated by Django 2.0.4 on 2018-04-16 17:46

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='user_submission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('firstname', models.CharField(max_length=255)),
                ('lastname', models.CharField(max_length=255)),
                ('phonearea', models.CharField(max_length=3)),
                ('phonefirst', models.CharField(max_length=3)),
                ('phonelast', models.CharField(max_length=4)),
                ('skypeid', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=255)),
                ('message', models.TextField()),
                ('ip', models.GenericIPAddressField()),
                ('timestamp', models.DateTimeField()),
            ],
        ),
    ]
