import React, { useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { useRegistration } from './RegistrationProvider';
import Input from '../ui/Input';
import Button from '../ui/Button';
import InterestsDialogSelector from './InterestsDialogSelector';

type UserInfoFormData = {
    name: string;
    surname: string;
    gender: 'male' | 'female';
    city?: string;
    region?: string;
    dateOfBirth: Date;
    bio?: string;
    interests?: number[];
};

export const UserInfoStep: React.FC = () => {
    const { formData, updateFormData, nextStep, prevStep } = useRegistration();
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedInterests, setSelectedInterests] = useState<number[]>(
        formData.interests || []
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<UserInfoFormData>({
        defaultValues: {
            name: formData.name || '',
            surname: formData.surname || '',
            gender: formData.gender || undefined,
            city: formData.city || '',
            region: formData.region || '',
            dateOfBirth: formData.dateOfBirth || undefined,
            bio: formData.bio || '',
        },
    });

    const onSubmit: SubmitHandler<UserInfoFormData> = (data) => {
        updateFormData({ ...data, interests: selectedInterests });
        nextStep();
    };

    const months = [
        { value: 0, label: 'January' },
        { value: 1, label: 'February' },
        { value: 2, label: 'March' },
        { value: 3, label: 'April' },
        { value: 4, label: 'May' },
        { value: 5, label: 'June' },
        { value: 6, label: 'July' },
        { value: 7, label: 'August' },
        { value: 8, label: 'September' },
        { value: 9, label: 'October' },
        { value: 10, label: 'November' },
        { value: 11, label: 'December' },
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const getDaysInMonth = (month: number, year: number) => {
        if (isNaN(month) || month < 0) return 31;
        return new Date(year || currentYear, month + 1, 0).getDate();
    };

    return (
        <>
            <h2 className='mb-4 text-2xl font-semibold text-slate-600'>
                Tell us about yourself
            </h2>
            <form
                className='flex flex-col gap-3'
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className='flex gap-3'>
                    <div className='flex flex-1 flex-col gap-1'>
                        <Input
                            type='text'
                            placeholder='First Name *'
                            {...register('name', {
                                required: 'First name is required',
                            })}
                        />
                        {errors.name && (
                            <span className='text-sm text-red-500'>
                                {errors.name.message}
                            </span>
                        )}
                    </div>
                    <div className='flex flex-1 flex-col gap-1'>
                        <Input
                            type='text'
                            placeholder='Last Name *'
                            {...register('surname', {
                                required: 'Last name is required',
                            })}
                        />
                        {errors.surname && (
                            <span className='text-sm text-red-500'>
                                {errors.surname.message}
                            </span>
                        )}
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-slate-600'>
                        Gender *
                    </label>
                    <div className='flex gap-6'>
                        <label className='flex cursor-pointer items-center gap-2'>
                            <input
                                type='radio'
                                value='male'
                                {...register('gender', {
                                    required: 'Gender is required',
                                })}
                                className='text-primary-600 focus:ring-primary-500 h-4 w-4 border-gray-300'
                            />
                            <span className='text-sm text-slate-700'>Male</span>
                        </label>
                        <label className='flex cursor-pointer items-center gap-2'>
                            <input
                                type='radio'
                                value='female'
                                {...register('gender', {
                                    required: 'Gender is required',
                                })}
                                className='text-primary-600 focus:ring-primary-500 h-4 w-4 border-gray-300'
                            />
                            <span className='text-sm text-slate-700'>
                                Female
                            </span>
                        </label>
                    </div>
                    {errors.gender && (
                        <span className='text-sm text-red-500'>
                            {errors.gender.message}
                        </span>
                    )}
                </div>

                <div className='relative flex flex-col gap-1'>
                    <label className='text-sm font-medium text-slate-600'>
                        Date of Birth *
                    </label>
                    <Controller
                        name='dateOfBirth'
                        control={control}
                        rules={{ required: 'Date of birth is required' }}
                        render={({ field }) => {
                            const currentDate = field.value;
                            const day = currentDate
                                ? currentDate.getDate()
                                : '';
                            const month = currentDate
                                ? currentDate.getMonth()
                                : '';
                            const year = currentDate
                                ? currentDate.getFullYear()
                                : '';

                            const daysInMonth =
                                month !== '' && year !== ''
                                    ? getDaysInMonth(
                                          month as number,
                                          year as number
                                      )
                                    : 31;
                            const days = Array.from(
                                { length: daysInMonth },
                                (_, i) => i + 1
                            );

                            return (
                                <div className='flex gap-2'>
                                    <select
                                        value={day}
                                        onChange={(e) => {
                                            const selectedDay = parseInt(
                                                e.target.value
                                            );
                                            if (isNaN(selectedDay)) return;

                                            const currentMonth =
                                                month !== ''
                                                    ? (month as number)
                                                    : new Date().getMonth();
                                            const currentYear =
                                                year !== ''
                                                    ? (year as number)
                                                    : new Date().getFullYear();

                                            const maxDays = getDaysInMonth(
                                                currentMonth,
                                                currentYear
                                            );
                                            const validDay =
                                                selectedDay > maxDays
                                                    ? maxDays
                                                    : selectedDay;
                                            const newDate = new Date(
                                                currentYear,
                                                currentMonth,
                                                validDay
                                            );
                                            field.onChange(newDate);
                                        }}
                                        className='outline-primary-400 flex-1 rounded-lg border border-gray-300 p-3 focus:outline-1'
                                    >
                                        <option value='' disabled>
                                            Day
                                        </option>
                                        {days.map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={month}
                                        onChange={(e) => {
                                            const selectedMonth = parseInt(
                                                e.target.value
                                            );
                                            if (isNaN(selectedMonth)) return;
                                            const currentDay =
                                                day !== ''
                                                    ? (day as number)
                                                    : 1;
                                            const currentYear =
                                                year !== ''
                                                    ? (year as number)
                                                    : new Date().getFullYear();

                                            const maxDaysInNewMonth =
                                                getDaysInMonth(
                                                    selectedMonth,
                                                    currentYear
                                                );
                                            const validDay =
                                                currentDay > maxDaysInNewMonth
                                                    ? maxDaysInNewMonth
                                                    : currentDay;
                                            const newDate = new Date(
                                                currentYear,
                                                selectedMonth,
                                                validDay
                                            );
                                            field.onChange(newDate);
                                        }}
                                        className='outline-primary-400 flex-1 rounded-lg border border-gray-300 p-3 focus:outline-1'
                                    >
                                        <option value='' disabled>
                                            Month
                                        </option>
                                        {months.map((m) => (
                                            <option
                                                key={m.value}
                                                value={m.value}
                                            >
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={year}
                                        onChange={(e) => {
                                            const selectedYear = parseInt(
                                                e.target.value
                                            );
                                            if (isNaN(selectedYear)) return;

                                            const currentDay =
                                                day !== ''
                                                    ? (day as number)
                                                    : 1;
                                            const currentMonth =
                                                month !== ''
                                                    ? (month as number)
                                                    : 0;

                                            const maxDaysInMonth =
                                                getDaysInMonth(
                                                    currentMonth,
                                                    selectedYear
                                                );
                                            const validDay =
                                                currentDay > maxDaysInMonth
                                                    ? maxDaysInMonth
                                                    : currentDay;
                                            const newDate = new Date(
                                                selectedYear,
                                                currentMonth,
                                                validDay
                                            );
                                            field.onChange(newDate);
                                        }}
                                        className='outline-primary-400 flex-1 rounded-lg border border-gray-300 p-3 focus:outline-1'
                                    >
                                        <option value='' disabled>
                                            Year
                                        </option>
                                        {years.map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        }}
                    />
                    {isDatePickerOpen && (
                        <div
                            className='fixed inset-0 z-5'
                            onClick={() => setIsDatePickerOpen(false)}
                        />
                    )}
                    {errors.dateOfBirth && (
                        <span className='text-sm text-red-500'>
                            {errors.dateOfBirth.message}
                        </span>
                    )}
                </div>

                <div className='flex gap-3'>
                    <div className='flex flex-1 flex-col gap-1'>
                        <Input
                            type='text'
                            placeholder='City (optional)'
                            {...register('city')}
                        />
                    </div>
                    <div className='flex flex-1 flex-col gap-1'>
                        <Input
                            type='text'
                            placeholder='Region/State (optional)'
                            {...register('region')}
                        />
                    </div>
                </div>

                <textarea
                    className='outline-primary-400 resize-none rounded-lg border border-gray-300 p-3 placeholder:text-slate-400 focus:outline-1'
                    rows={4}
                    placeholder='Tell us a bit about yourself... (optional)'
                    {...register('bio')}
                />

                <div className='mt-4'>
                    <label className='text-sm font-medium text-slate-600'>
                        Interests (optional)
                    </label>
                    <InterestsDialogSelector
                        selectedIds={selectedInterests}
                        onChange={(next) => setSelectedInterests(next)}
                        placeholder='Choose your interests'
                    />
                </div>

                <div className='mt-4 flex gap-3'>
                    <Button type='button' onClick={prevStep} className='flex-1'>
                        Back
                    </Button>
                    <Button type='submit' className='flex-1'>
                        Continue
                    </Button>
                </div>
            </form>
        </>
    );
};
