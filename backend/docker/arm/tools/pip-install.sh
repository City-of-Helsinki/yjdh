#!/usr/bin/env bash


function usage {
    echo "Usage: $0 [-p <path>] [-u <user>] -a <command>"
    echo "  -a      argument for 'pip install'"
    echo "  -p      path to run in"
    echo "  -u      user to run as (forces pip --user flag)"
    exit 1;
}

while getopts ":p::a:u::" o; do
    case "${o}" in
        p)
            p=${OPTARG}
            ;;
        a)
            a=${OPTARG}
            ;;
        u)
            u=${OPTARG}
            ;;
        *)
            usage
            ;;
    esac
done

if [ -z "${a}" ]; then
    usage
fi

path_command=""
if [ ! -z "${p}" ]; then
    path_command="cd ${p} &&"
fi


if [ ! -z "${u}" ]; then
    echo "Running with user"
    su - appuser -c "${path_command} pip install --user --no-cache-dir ${a}"
else
    echo "Running without user"
    bash -c "${path_command} pip install --no-cache-dir ${a}"
fi
