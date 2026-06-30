import { Select } from 'antd';
import type { UserListItem } from '../../api/users';
import { filterUsersByEmail } from './taskPresentation';

type AssigneeOption = {
    value: string | number;
    label: string;
};

type AssigneeSelectProps = {
    className?: string;
    extraOptions?: AssigneeOption[];
    isLoading: boolean;
    onChange: (value: string | number) => void;
    placeholder: string;
    users: UserListItem[];
    value?: string | number;
    allowClear?: boolean;
};

function AssigneeSelect({
    className,
    extraOptions,
    isLoading,
    onChange,
    placeholder,
    users,
    value,
    allowClear,
}: AssigneeSelectProps) {
    return (
        <Select
            allowClear={allowClear}
            showSearch
            filterOption={filterUsersByEmail}
            loading={isLoading}
            className={className}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            options={[
                ...(extraOptions ?? []),
                ...users.map((user) => ({
                    value: user.id,
                    label: user.email,
                })),
            ]}
        />
    );
}

export default AssigneeSelect;
