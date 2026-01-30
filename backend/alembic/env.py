from logging.config import fileConfig
import asyncio
import sys
import os

# Add the project root to python path to allow importing app
sys.path.append(os.getcwd())

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import AsyncEngine
from alembic import context

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import get_async_engine

# Import all models here so they are registered with Base.metadata
# Import all models here so they are registered with Base.metadata
from app.models.user import User
from app.models.campus import Campus, Infrastructure, ConsumptionRecord

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# target_metadata = mymodel.Base.metadata
config.set_main_option('sqlalchemy.url', get_settings().database_url)

target_metadata = Base.metadata


def run_migrations_offline():
    '''Run migrations in 'offline' mode.'''
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(
        connection=connection, 
        target_metadata=target_metadata,
        render_as_batch=True
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    '''Run migrations in 'online' mode.'''
    connectable = get_async_engine()

    if isinstance(connectable, AsyncEngine):
        async def async_main():
            async with connectable.connect() as connection:
                await connection.run_sync(do_run_migrations)

        asyncio.run(async_main())
    else:
        with connectable.connect() as connection:
            do_run_migrations(connection)


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
